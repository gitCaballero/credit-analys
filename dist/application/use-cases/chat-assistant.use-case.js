"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAssistantUseCase = void 0;
const common_1 = require("@nestjs/common");
const create_proposal_use_case_1 = require("./create-proposal.use-case");
const get_proposal_status_use_case_1 = require("./get-proposal-status.use-case");
const list_proposals_use_case_1 = require("./list-proposals.use-case");
const validate_offer_eligibility_use_case_1 = require("./validate-offer-eligibility.use-case");
const validate_benefits_use_case_1 = require("./validate-benefits.use-case");
const submit_proposal_use_case_1 = require("./submit-proposal.use-case");
const create_card_account_use_case_1 = require("./create-card-account.use-case");
const activate_benefits_use_case_1 = require("./activate-benefits.use-case");
const generate_proposal_explanation_use_case_1 = require("./generate-proposal-explanation.use-case");
const pii_util_1 = require("../../shared/security/pii.util");
const GENERAL_TOOL_DESCRIPTORS = [
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
const CUSTOMER_TOOL_DESCRIPTORS = GENERAL_TOOL_DESCRIPTORS.filter((tool) => ['create_proposal', 'check_status', 'explain_proposal'].includes(tool.name));
const CREDIT_SPECIALIST_TOOL_DESCRIPTORS = GENERAL_TOOL_DESCRIPTORS.filter((tool) => [
    'check_status',
    'list_proposals',
    'validate_offer',
    'validate_benefits',
    'submit_proposal',
    'create_card_account',
    'activate_benefits',
    'explain_proposal',
].includes(tool.name));
let ChatAssistantUseCase = class ChatAssistantUseCase {
    constructor(createProposalUseCase, validateOfferEligibilityUseCase, validateBenefitSelectionUseCase, submitProposalUseCase, createCardAccountUseCase, activateBenefitsUseCase, getProposalStatusUseCase, listProposalsUseCase, generateProposalExplanationUseCase, chatAssistantModelPort) {
        this.createProposalUseCase = createProposalUseCase;
        this.validateOfferEligibilityUseCase = validateOfferEligibilityUseCase;
        this.validateBenefitSelectionUseCase = validateBenefitSelectionUseCase;
        this.submitProposalUseCase = submitProposalUseCase;
        this.createCardAccountUseCase = createCardAccountUseCase;
        this.activateBenefitsUseCase = activateBenefitsUseCase;
        this.getProposalStatusUseCase = getProposalStatusUseCase;
        this.listProposalsUseCase = listProposalsUseCase;
        this.generateProposalExplanationUseCase = generateProposalExplanationUseCase;
        this.chatAssistantModelPort = chatAssistantModelPort;
    }
    async execute(request) {
        const audience = request.audience ?? 'general';
        const availableTools = this.getAvailableTools(audience);
        const modelRequest = {
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
            const toolResult = await this.invokeTool(interpreted.toolName, interpreted.toolInput, request.proposalId, request.parameters);
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
        catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
            if (message.includes('benefits validation')) {
                return {
                    message: 'A proposta deve completar a validação de benefícios antes de ser enviada. Por favor, use a opção 4 para validar os benefícios primeiro.',
                    source: 'chat-model',
                };
            }
            return {
                message: `Erro ao processar a solicitação: ${message}`,
                source: 'chat-model',
            };
        }
    }
    async executeTool(toolName, parameters, audience = 'credit_specialist') {
        const availableTools = this.getAvailableTools(audience);
        if (!availableTools.some((tool) => tool.name === toolName)) {
            return {
                message: this.getUnavailableToolMessage(audience, toolName),
                source: 'cli',
            };
        }
        try {
            const toolResult = await this.invokeTool(toolName, parameters, parameters.proposalId, parameters);
            return {
                message: toolResult.message,
                toolName,
                toolResult: toolResult.data,
                source: 'cli',
                metadata: {
                    requestedBy: parameters.proposalId ?? 'anonymous',
                },
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
            return {
                message: `Error al ejecutar la herramienta: ${message}`,
                source: 'cli',
            };
        }
    }
    getAvailableTools(audience) {
        switch (audience) {
            case 'customer':
                return CUSTOMER_TOOL_DESCRIPTORS;
            case 'credit_specialist':
                return CREDIT_SPECIALIST_TOOL_DESCRIPTORS;
            default:
                return GENERAL_TOOL_DESCRIPTORS;
        }
    }
    getUnavailableToolMessage(audience, toolName) {
        if (audience === 'customer') {
            return `A ação ${toolName} não está disponível no assistente do cliente. Posso ajudar com a criação da proposta, seleção de benefícios e consulta de status.`;
        }
        if (audience === 'credit_specialist') {
            return `A ação ${toolName} não está disponível neste fluxo do especialista. Posso ajudar com validação, envio, criação do cartão, ativação de benefícios e consulta de status.`;
        }
        return `A ação ${toolName} não está disponível neste contexto.`;
    }
    async invokeTool(toolName, toolInput, fallbackProposalId, requestParameters) {
        const proposalId = toolInput.proposalId ?? fallbackProposalId;
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
                return this.handleValidateBenefits(proposalId, toolInput.selectedBenefits);
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
    async handleCreateProposal(toolInput, requestParameters) {
        const profileFromTool = (toolInput.customerProfile ?? {});
        const profileFromParams = (requestParameters?.customerProfile ?? {});
        const customerProfile = {
            ...profileFromParams,
            ...profileFromTool,
        };
        const offerType = (toolInput.offerType ?? requestParameters?.offerType);
        const selectedBenefits = (toolInput.selectedBenefits ?? requestParameters?.selectedBenefits ?? []);
        const proposalId = String(toolInput.proposalId ?? requestParameters?.proposalId ?? `proposal-${Date.now()}`);
        const missingProfileField = [
            { key: 'fullName', label: 'nome completo' },
            { key: 'nationalId', label: 'documento de identidade' },
            { key: 'income', label: 'renda' },
            { key: 'investments', label: 'investimentos' },
            { key: 'currentAccountYears', label: 'anos de conta corrente' },
            { key: 'email', label: 'email' },
        ].find((field) => !customerProfile[field.key]);
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
        const command = {
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
    async handleCheckStatus(proposalId) {
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
    async handleValidateOffer(proposalId) {
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
    async handleValidateBenefits(proposalId, selectedBenefits) {
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
    async handleSubmitProposal(proposalId) {
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
    async handleCreateCardAccount(proposalId) {
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
    async handleActivateBenefits(proposalId) {
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
    async handleExplainProposal(proposalId) {
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
    async handleListProposals() {
        const result = await this.listProposalsUseCase.execute();
        return {
            message: result.length > 0
                ? `Encontrei ${result.length} propostas para acompanhamento.`
                : 'Não encontrei propostas cadastradas.',
            data: result.map((proposal) => ({
                ...proposal,
                customerProfile: {
                    ...proposal.customerProfile,
                    nationalId: (0, pii_util_1.maskNationalId)(proposal.customerProfile.nationalId),
                    email: (0, pii_util_1.maskEmail)(proposal.customerProfile.email),
                },
            })),
        };
    }
    toCreateProposalResponse(proposal) {
        return {
            proposalId: proposal.proposalId,
            customerProfile: {
                fullName: proposal.customerProfile.fullName,
                nationalId: (0, pii_util_1.maskNationalId)(proposal.customerProfile.nationalId),
                income: proposal.customerProfile.income,
                investments: proposal.customerProfile.investments,
                currentAccountYears: proposal.customerProfile.currentAccountYears,
                email: (0, pii_util_1.maskEmail)(proposal.customerProfile.email),
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
};
exports.ChatAssistantUseCase = ChatAssistantUseCase;
exports.ChatAssistantUseCase = ChatAssistantUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(9, (0, common_1.Inject)('ChatAssistantModelPort')),
    __metadata("design:paramtypes", [create_proposal_use_case_1.CreateProposalUseCase,
        validate_offer_eligibility_use_case_1.ValidateOfferEligibilityUseCase,
        validate_benefits_use_case_1.ValidateBenefitSelectionUseCase,
        submit_proposal_use_case_1.SubmitProposalUseCase,
        create_card_account_use_case_1.CreateCardAccountUseCase,
        activate_benefits_use_case_1.ActivateBenefitsUseCase,
        get_proposal_status_use_case_1.GetProposalStatusUseCase,
        list_proposals_use_case_1.ListProposalsUseCase,
        generate_proposal_explanation_use_case_1.GenerateProposalExplanationUseCase, Object])
], ChatAssistantUseCase);
