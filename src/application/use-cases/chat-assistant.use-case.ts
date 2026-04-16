import { Inject, Injectable } from '@nestjs/common';
import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { OfferType } from '../../domain/enums/offer-type.enum';
import { CreateProposalCommand, CreateProposalUseCase } from './create-proposal.use-case';
import { GetProposalStatusUseCase } from './get-proposal-status.use-case';
import { ValidateOfferEligibilityUseCase } from './validate-offer-eligibility.use-case';
import { ValidateBenefitSelectionUseCase } from './validate-benefits.use-case';
import { SubmitProposalUseCase } from './submit-proposal.use-case';
import { CreateCardAccountUseCase } from './create-card-account.use-case';
import { ActivateBenefitsUseCase } from './activate-benefits.use-case';
import { GenerateProposalExplanationUseCase } from './generate-proposal-explanation.use-case';
import {
  ChatAssistantModelAdapter,
  ChatAssistantModelRequest,
  ChatAssistantModelResponse,
  ChatAssistantRequest,
  ChatAssistantResponse,
  ChatToolDescriptor,
} from '../ports/chat-assistant.adapter';

const TOOL_DESCRIPTORS: ChatToolDescriptor[] = [
  {
    name: 'create_proposal',
    description: 'Solicitar un crédito nuevo con perfil de cliente, tipo de oferta y beneficios seleccionados.',
    requiredParameters: ['proposalId', 'customerProfile', 'offerType', 'selectedBenefits'],
  },
  {
    name: 'check_status',
    description: 'Consultar el estado actual de una propuesta de crédito.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'validate_offer',
    description: 'Validar la elegibilidad de la propuesta para la oferta elegida.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'validate_benefits',
    description: 'Validar los beneficios seleccionados para la propuesta.',
    requiredParameters: ['proposalId', 'selectedBenefits'],
  },
  {
    name: 'submit_proposal',
    description: 'Enviar la propuesta de crédito para continuar con la creación de tarjeta.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'create_card_account',
    description: 'Solicitar la creación de la cuenta de tarjeta asociada a la propuesta.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'activate_benefits',
    description: 'Activar los beneficios una vez que la tarjeta de crédito esté creada.',
    requiredParameters: ['proposalId'],
  },
  {
    name: 'explain_proposal',
    description: 'Generar una explicación del estado y decisiones de la propuesta.',
    requiredParameters: ['proposalId'],
  },
];

@Injectable()
export class ChatAssistantUseCase {
  constructor(
    private readonly createProposalUseCase: CreateProposalUseCase,
    private readonly validateOfferEligibilityUseCase: ValidateOfferEligibilityUseCase,
    private readonly validateBenefitSelectionUseCase: ValidateBenefitSelectionUseCase,
    private readonly submitProposalUseCase: SubmitProposalUseCase,
    private readonly createCardAccountUseCase: CreateCardAccountUseCase,
    private readonly activateBenefitsUseCase: ActivateBenefitsUseCase,
    private readonly getProposalStatusUseCase: GetProposalStatusUseCase,
    private readonly generateProposalExplanationUseCase: GenerateProposalExplanationUseCase,
    @Inject('ChatAssistantModelAdapter')
    private readonly modelAdapter: ChatAssistantModelAdapter,
  ) {}

  async execute(request: ChatAssistantRequest): Promise<ChatAssistantResponse> {
    const modelRequest: ChatAssistantModelRequest = {
      userMessage: request.userMessage,
      proposalId: request.proposalId,
      availableTools: TOOL_DESCRIPTORS,
      parameters: request.parameters,
    };

    const interpreted = await this.modelAdapter.interpretIntent(modelRequest);
    if (!interpreted.toolName || interpreted.toolName === 'none') {
      return {
        message: interpreted.assistantMessage,
        source: 'chat-model',
      };
    }

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
        return this.handleCreateProposal(toolInput);
      case 'check_status':
        return this.handleCheckStatus(proposalId);
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
          message: 'No encontré una herramienta válida para tu solicitud.',
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
      { key: 'fullName', label: 'nombre completo' },
      { key: 'nationalId', label: 'documento de identidad' },
      { key: 'income', label: 'ingresos' },
      { key: 'investments', label: 'inversiones' },
      { key: 'currentAccountYears', label: 'años de antigüedad en la cuenta' },
      { key: 'email', label: 'correo electrónico' },
    ].find((field) => !customerProfile[field.key as keyof typeof customerProfile]);

    if (missingProfileField) {
      return {
        message: `Por favor, indícame el ${missingProfileField.label} del cliente.`,
        data: null,
      };
    }

    if (!offerType) {
      return {
        message: 'Indica el tipo de oferta que deseas: A, B o C.',
        data: null,
      };
    }

    if (!selectedBenefits || selectedBenefits.length === 0) {
      return {
        message: 'Por favor, dime qué beneficios deseas incluir en la tarjeta (por ejemplo: CASHBACK, POINTS, TRAVEL_INSURANCE, VIP_LOUNGE).',
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
      message: `Propuesta creada con ID ${result.proposalId}. Continúa con la validación de la oferta o beneficios según prefieras.`,
      data: result,
    };
  }

  private async handleCheckStatus(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Necesito el ID de la propuesta para consultar su estado.',
        data: null,
      };
    }

    const result = await this.getProposalStatusUseCase.execute(proposalId);
    if (!result) {
      return {
        message: `No encontré una propuesta con el ID ${proposalId}.`,
        data: null,
      };
    }

    return {
      message: `El estado de la propuesta ${proposalId} es ${result.status}.`,
      data: result,
    };
  }

  private async handleValidateOffer(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Por favor indica el ID de la propuesta para validar la oferta.',
        data: null,
      };
    }

    const result = await this.validateOfferEligibilityUseCase.execute(proposalId);
    return {
      message: result.approved
        ? `La oferta ha sido validada. Ofertas elegibles: ${result.eligibleOffers.join(', ')}.`
        : `La oferta fue rechazada. Razones: ${result.reasons.join(', ')}.`,
      data: result,
    };
  }

  private async handleValidateBenefits(proposalId?: string, selectedBenefits?: BenefitType[]) {
    if (!proposalId) {
      return {
        message: 'Necesito el ID de la propuesta para validar los beneficios.',
        data: null,
      };
    }

    if (!selectedBenefits || selectedBenefits.length === 0) {
      return {
        message: 'Indica los beneficios que quieres validar, por ejemplo: CASHBACK, POINTS o TRAVEL_INSURANCE.',
        data: null,
      };
    }

    const result = await this.validateBenefitSelectionUseCase.execute(proposalId, selectedBenefits);
    return {
      message: result.approved
        ? `Los beneficios han sido validados correctamente.`
        : `Los beneficios no pudieron ser validados. Razones: ${result.reasons.join(', ')}.`,
      data: result,
    };
  }

  private async handleSubmitProposal(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Necesito el ID de la propuesta para enviar la solicitud.',
        data: null,
      };
    }

    const result = await this.submitProposalUseCase.execute(proposalId);
    return {
      message: `La propuesta ${proposalId} fue enviada. Estado actual: ${result.status}.`,
      data: result,
    };
  }

  private async handleCreateCardAccount(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Necesito el ID de la propuesta para crear la cuenta de tarjeta.',
        data: null,
      };
    }

    const result = await this.createCardAccountUseCase.execute(proposalId);
    return {
      message: `Solicitud de creación de tarjeta registrada. Estado: ${result.status}.`,
      data: result,
    };
  }

  private async handleActivateBenefits(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Necesito el ID de la propuesta para activar los beneficios.',
        data: null,
      };
    }

    const result = await this.activateBenefitsUseCase.execute(proposalId);
    return {
      message: result.completed
        ? `Los beneficios se activaron correctamente y la propuesta está completa.`
        : `La activación se procesó. Revisa el estado actual de la propuesta.`,
      data: result,
    };
  }

  private async handleExplainProposal(proposalId?: string) {
    if (!proposalId) {
      return {
        message: 'Necesito el ID de la propuesta para generar una explicación.',
        data: null,
      };
    }

    const result = await this.generateProposalExplanationUseCase.execute(proposalId);
    if (!result) {
      return {
        message: `No encontré la propuesta ${proposalId}.`,
        data: null,
      };
    }

    return {
      message: result.explanation,
      data: result,
    };
  }
}
