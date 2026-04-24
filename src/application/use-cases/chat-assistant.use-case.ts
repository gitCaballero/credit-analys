import { Inject, Injectable } from '@nestjs/common';
import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { OfferType } from '../../domain/enums/offer-type.enum';
import { CreateProposalCommand, CreateProposalUseCase } from './create-proposal.use-case';
import { GetProposalStatusUseCase } from './get-proposal-status.use-case';
import { ListProposalsUseCase } from './list-proposals.use-case';
import { ValidateOfferEligibilityUseCase } from './validate-offer-eligibility.use-case';
import { ValidateBenefitSelectionUseCase } from './validate-benefits.use-case';
import { SubmitProposalUseCase } from './submit-proposal.use-case';
import { CreateCardAccountUseCase } from './create-card-account.use-case';
import { ActivateBenefitsUseCase } from './activate-benefits.use-case';
import { GenerateProposalExplanationUseCase } from './generate-proposal-explanation.use-case';
import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { maskEmail, maskNationalId } from '../../shared/security/pii.util';
import { AssistantWorkflowPort } from '../ports/inbound/assistant-workflow.port';
import {
  AssistantAudience,
  ChatAssistantModelPort,
  ChatAssistantModelRequest,
  ChatAssistantRequest,
  ChatAssistantResponse,
  ChatToolDescriptor,
} from '../ports/outbound/chat-assistant-model.port';

const GENERAL_TOOL_DESCRIPTORS: ChatToolDescriptor[] = [
  {
    name: 'create_proposal',
    description: 'Solicitar um novo crédito com perfil do cliente, tipo de oferta e benefícios selecionados.',
    requiredParameters: ['proposalId', 'customerProfile', 'offerType', 'selectedBenefits'],
  },
  {
    name: 'check_status',
    description: 'Consultar o status atual de uma proposta de crédito.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'list_proposals',
    description: 'Consultar o resumo de todas as propostas para acompanhamento operacional.',
    requiredParameters: [],
  },
  {
    name: 'validate_offer',
    description: 'Validar a elegibilidade da proposta para a oferta escolhida.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'validate_benefits',
    description: 'Validar os benefícios selecionados para a proposta.',
    requiredParameters: ['proposalId', 'selectedBenefits'],
  },
  {
    name: 'submit_proposal',
    description: 'Enviar a proposta de crédito para continuar com a criação do cartão.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'create_card_account',
    description: 'Solicitar a criação da conta de cartão associada à proposta.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'activate_benefits',
    description: 'Ativar os benefícios assim que o cartão de crédito for criado.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'explain_proposal',
    description: 'Gerar uma explicação do status e das decisões da proposta.',
    requiredParameters: ['proposalId'],
  },
];

const CUSTOMER_TOOL_DESCRIPTORS: ChatToolDescriptor[] = GENERAL_TOOL_DESCRIPTORS.filter((tool) =>
  ['create_proposal', 'check_status', 'explain_proposal'].includes(tool.name),
);

const CREDIT_SPECIALIST_TOOL_DESCRIPTORS: ChatToolDescriptor[] = GENERAL_TOOL_DESCRIPTORS.filter((tool) =>
  [
    'check_status',
    'list_proposals',
    'validate_offer',
    'validate_benefits',
    'submit_proposal',
    'create_card_account',
    'activate_benefits',
    'explain_proposal',
  ].includes(tool.name),
);

@Injectable()
export class ChatAssistantUseCase implements AssistantWorkflowPort {
  constructor(
    private readonly createProposalUseCase: CreateProposalUseCase,
    private readonly validateOfferEligibilityUseCase: ValidateOfferEligibilityUseCase,
    private readonly validateBenefitSelectionUseCase: ValidateBenefitSelectionUseCase,
    private readonly submitProposalUseCase: SubmitProposalUseCase,
    private readonly createCardAccountUseCase: CreateCardAccountUseCase,
    private readonly activateBenefitsUseCase: ActivateBenefitsUseCase,
    private readonly getProposalStatusUseCase: GetProposalStatusUseCase,
    private readonly listProposalsUseCase: ListProposalsUseCase,
    private readonly generateProposalExplanationUseCase: GenerateProposalExplanationUseCase,
    @Inject('ChatAssistantModelPort')
    private readonly chatAssistantModelPort: ChatAssistantModelPort,
  ) {}

  async execute(request: ChatAssistantRequest): Promise<ChatAssistantResponse> {
    const audience = request.audience ?? 'general';
    const availableTools = this.getAvailableTools(audience);
    const modelRequest: ChatAssistantModelRequest = {
      userMessage: request.userMessage,
      proposalId: request.proposalId,
      availableTools,
      parameters: request.parameters,
      audience,
    };

    const interpreted = await this.chatAssistantModelPort.interpretIntent(modelRequest);
    if (!interpreted.toolName || interpreted.toolName === 'none') {
      return {
        message: interpreted.assistantMessage,
        source: 'chat-model',
      };
    }

    if (!availableTools.some((tool) => tool.name === interpreted.toolName)) {
      return {
        message: this.getUnavailableToolMessage(audience, interpreted.toolName),
        source: 'chat-model',
      };
    }

    try {
      const toolResult = await this.invokeTool(
        interpreted.toolName,
        interpreted.toolInput,
        request.proposalId,
        request.parameters,
      );

      return {
        message: toolResult.message,
        toolName: interpreted.toolName,
        toolResult: toolResult.data,
        source: 'chat-model',
        metadata: {
          requestedBy: request.proposalId ?? 'anonymous',
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      if (message.includes('benefits validation')) {
        return {
          message:
            'A proposta deve completar a validação de benefícios antes de ser enviada. Por favor, use a opção 4 para validar os benefícios primeiro.',
          source: 'chat-model',
        };
      }
      return {
        message: `Erro ao processar a solicitação: ${message}`,
        source: 'chat-model',
      };
    }
  }

  async executeTool(
    toolName: string,
    parameters: Record<string, unknown>,
    audience: AssistantAudience = 'credit_specialist',
  ): Promise<ChatAssistantResponse> {
    const availableTools = this.getAvailableTools(audience);
    if (!availableTools.some((tool) => tool.name === toolName)) {
      return {
        message: this.getUnavailableToolMessage(audience, toolName),
        source: 'cli',
      };
    }

    try {
      const toolResult = await this.invokeTool(toolName, parameters, parameters.proposalId as string | undefined, parameters);
      return {
        message: toolResult.message,
        toolName,
        toolResult: toolResult.data,
        source: 'cli',
        metadata: {
          requestedBy: (parameters.proposalId as string) ?? 'anonymous',
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      return {
        message: `Error al ejecutar la herramienta: ${message}`,
        source: 'cli',
      };
    }
  }

  private getAvailableTools(audience: AssistantAudience): ChatToolDescriptor[] {
    switch (audience) {
      case 'customer':
        return CUSTOMER_TOOL_DESCRIPTORS;
      case 'credit_specialist':
        return CREDIT_SPECIALIST_TOOL_DESCRIPTORS;
      default:
        return GENERAL_TOOL_DESCRIPTORS;
    }
  }

  private getUnavailableToolMessage(audience: AssistantAudience, toolName: string): string {
    if (audience === 'customer') {
      return `A ação ${toolName} não está disponível no assistente do cliente. Posso ajudar com a criação da proposta, seleção de benefícios e consulta de status.`;
    }
    if (audience === 'credit_specialist') {
      return `A ação ${toolName} não está disponível neste fluxo do especialista. Posso ajudar com validação, envio, criação do cartão, ativação de benefícios e consulta de status.`;
    }
    return `A ação ${toolName} não está disponível neste contexto.`;
  }

  private async invokeTool(
    toolName: string,
    toolInput: Record<string, unknown>,
    fallbackProposalId?: string,
    requestParameters?: Record<string, unknown>,
  ): Promise<{ message: string; data: unknown }> {
    const proposalId = (toolInput.proposalId as string) ?? fallbackProposalId;
    switch (toolName) {
      case 'create_proposal':
        return this.handleCreateProposal(toolInput, requestParameters);
      case 'check_status':
        return this.handleCheckStatus(proposalId);
      case 'list_proposals':
        return this.handleListProposals();
      case 'validate_offer':
        return this.handleValidateOffer(proposalId);
      case 'validate_benefits':
        return this.handleValidateBenefits(proposalId, toolInput.selectedBenefits as BenefitType[]);
      case 'submit_proposal':
        return this.handleSubmitProposal(proposalId);
      case 'create_card_account':
        return this.handleCreateCardAccount(proposalId);
      case 'activate_benefits':
        return this.handleActivateBenefits(proposalId);
      case 'explain_proposal':
        return this.handleExplainProposal(proposalId);
      default:
        return {
          message: 'Não encontrei uma ferramenta válida para a sua solicitação.',
          data: null,
        };
    }
  }

  private async handleCreateProposal(toolInput: Record<string, unknown>, requestParameters?: Record<string, unknown>) {
    const profileFromTool = (toolInput.customerProfile ?? {}) as Partial<CreateProposalCommand['customerProfile']>;
    const profileFromParams = (requestParameters?.customerProfile ?? {}) as Partial<CreateProposalCommand['customerProfile']>;
    const customerProfile: Partial<CreateProposalCommand['customerProfile']> = {
      ...profileFromParams,
      ...profileFromTool,
    };

    const offerType = (toolInput.offerType ?? requestParameters?.offerType) as OfferType | undefined;
    const selectedBenefits = (toolInput.selectedBenefits ?? requestParameters?.selectedBenefits ?? []) as BenefitType[];
    const proposalId = String(toolInput.proposalId ?? requestParameters?.proposalId ?? `proposal-${Date.now()}`);

    const missingProfileField = [
      { key: 'fullName', label: 'nome completo' },
      { key: 'nationalId', label: 'documento de identidade' },
      { key: 'income', label: 'renda' },
      { key: 'investments', label: 'investimentos' },
      { key: 'currentAccountYears', label: 'anos de conta corrente' },
      { key: 'email', label: 'email' },
    ].find((field) => !customerProfile[field.key as keyof typeof customerProfile]);

    if (missingProfileField) {
      return {
        message: `Por favor, informe o ${missingProfileField.label} do cliente.`,
        data: null,
      };
    }

    if (!offerType) {
      return {
        message: 'Indique o tipo de oferta desejada: A, B ou C.',
        data: null,
      };
    }

    if (!selectedBenefits || selectedBenefits.length === 0) {
      return {
        message: 'Por favor, informe quais benefícios deseja incluir no cartão (por exemplo: CASHBACK, POINTS, TRAVEL_INSURANCE, VIP_LOUNGE).',
        data: null,
      };
    }

    const command: CreateProposalCommand = {
      proposalId,
      customerProfile: {
        fullName: String(customerProfile.fullName),
        nationalId: String(customerProfile.nationalId),
        income: Number(customerProfile.income),
        investments: Number(customerProfile.investments),
        currentAccountYears: Number(customerProfile.currentAccountYears),
        email: String(customerProfile.email),
      },
      offerType,
      selectedBenefits,
    };

    const result = await this.createProposalUseCase.execute(command);
    return {
      message: `Proposta criada com ID ${result.proposalId}. Continue com a validação da oferta ou dos benefícios conforme preferir.`,
      data: this.toCreateProposalResponse(result),
    };
  }

  private async handleCheckStatus(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Preciso do ID da proposta para consultar seu status.',
        data: null,
      };
    }

    const result = await this.getProposalStatusUseCase.execute(proposalId);
    if (!result) {
      return {
        message: `Não encontrei uma proposta com o ID ${proposalId}.`,
        data: null,
      };
    }

    return {
      message: `O status da proposta ${proposalId} é ${result.status}.`,
      data: result,
    };
  }

  private async handleValidateOffer(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Por favor, informe o ID da proposta para validar a oferta.',
        data: null,
      };
    }

    const result = await this.validateOfferEligibilityUseCase.execute(proposalId);
    return {
      message: result.approved
        ? `A oferta foi validada. Ofertas elegíveis: ${result.eligibleOffers.join(', ')}.`
        : `A oferta foi rejeitada. Motivos: ${result.reasons.join(', ')}.`,
      data: result,
    };
  }

  private async handleValidateBenefits(proposalId?: string, selectedBenefits?: BenefitType[]) {
    if (!proposalId) {
      return {
        message: 'Preciso do ID da proposta para validar os benefícios.',
        data: null,
      };
    }

    if (!selectedBenefits || selectedBenefits.length === 0) {
      return {
        message: 'Informe os benefícios que deseja validar, por exemplo: CASHBACK, POINTS ou TRAVEL_INSURANCE.',
        data: null,
      };
    }

    const result = await this.validateBenefitSelectionUseCase.execute(proposalId, selectedBenefits);
    return {
      message: result.approved
        ? `Os benefícios foram validados corretamente.`
        : `Os benefícios não puderam ser validados. Motivos: ${result.reasons.join(', ')}.`,
      data: result,
    };
  }

  private async handleSubmitProposal(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Preciso do ID da proposta para enviar a solicitação.',
        data: null,
      };
    }

    const result = await this.submitProposalUseCase.execute(proposalId);
    return {
      message: `A proposta ${proposalId} foi enviada. Status atual: ${result.status}.`,
      data: result,
    };
  }

  private async handleCreateCardAccount(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Preciso do ID da proposta para criar a conta do cartão.',
        data: null,
      };
    }

    const result = await this.createCardAccountUseCase.execute(proposalId);
    return {
      message: `Solicitação de criação do cartão registrada. Status: ${result.status}.`,
      data: result,
    };
  }

  private async handleActivateBenefits(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Preciso do ID da proposta para ativar os benefícios.',
        data: null,
      };
    }

    const result = await this.activateBenefitsUseCase.execute(proposalId);
    return {
      message: result.completed
        ? `Os benefícios foram ativados corretamente e a proposta está completa.`
        : `A ativação foi processada. Verifique o status atual da proposta.`,
      data: result,
    };
  }

  private async handleExplainProposal(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Preciso do ID da proposta para gerar uma explicação.',
        data: null,
      };
    }

    const result = await this.generateProposalExplanationUseCase.execute(proposalId);
    if (!result) {
      return {
        message: `Não encontrei a proposta ${proposalId}.`,
        data: null,
      };
    }

    return {
      message: result.explanation,
      data: result,
    };
  }

  private async handleListProposals() {
    const result = await this.listProposalsUseCase.execute();
    return {
      message: result.length > 0
        ? `Encontrei ${result.length} propostas para acompanhamento.`
        : 'Não encontrei propostas cadastradas.',
      data: result.map((proposal) => ({
        ...proposal,
        customerProfile: {
          ...proposal.customerProfile,
          nationalId: maskNationalId(proposal.customerProfile.nationalId),
          email: maskEmail(proposal.customerProfile.email),
        },
      })),
    };
  }

  private toCreateProposalResponse(proposal: CreditCardProposal) {
    return {
      proposalId: proposal.proposalId,
      customerProfile: {
        fullName: proposal.customerProfile.fullName,
        nationalId: maskNationalId(proposal.customerProfile.nationalId),
        income: proposal.customerProfile.income,
        investments: proposal.customerProfile.investments,
        currentAccountYears: proposal.customerProfile.currentAccountYears,
        email: maskEmail(proposal.customerProfile.email),
      },
      offerType: proposal.offerType,
      selectedBenefits: proposal.selectedBenefits.benefits,
      benefitActivationStatus: proposal.benefitActivationStatus,
      auditEntries: proposal.auditEntries,
      status: proposal.status,
      cardCreationStatus: proposal.cardCreationStatus,
      rejectionReason: proposal.rejectionReason,
      cardId: proposal.cardId,
    };
  }
}
