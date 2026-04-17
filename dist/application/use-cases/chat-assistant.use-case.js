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
const validate_offer_eligibility_use_case_1 = require("./validate-offer-eligibility.use-case");
const validate_benefits_use_case_1 = require("./validate-benefits.use-case");
const submit_proposal_use_case_1 = require("./submit-proposal.use-case");
const create_card_account_use_case_1 = require("./create-card-account.use-case");
const activate_benefits_use_case_1 = require("./activate-benefits.use-case");
const generate_proposal_explanation_use_case_1 = require("./generate-proposal-explanation.use-case");
const TOOL_DESCRIPTORS = [
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
let ChatAssistantUseCase = class ChatAssistantUseCase {
    constructor(createProposalUseCase, validateOfferEligibilityUseCase, validateBenefitSelectionUseCase, submitProposalUseCase, createCardAccountUseCase, activateBenefitsUseCase, getProposalStatusUseCase, generateProposalExplanationUseCase, modelAdapter) {
        this.createProposalUseCase = createProposalUseCase;
        this.validateOfferEligibilityUseCase = validateOfferEligibilityUseCase;
        this.validateBenefitSelectionUseCase = validateBenefitSelectionUseCase;
        this.submitProposalUseCase = submitProposalUseCase;
        this.createCardAccountUseCase = createCardAccountUseCase;
        this.activateBenefitsUseCase = activateBenefitsUseCase;
        this.getProposalStatusUseCase = getProposalStatusUseCase;
        this.generateProposalExplanationUseCase = generateProposalExplanationUseCase;
        this.modelAdapter = modelAdapter;
    }
    async execute(request) {
        const modelRequest = {
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
    async executeTool(toolName, parameters) {
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
    async invokeTool(toolName, toolInput, fallbackProposalId, requestParameters) {
        const proposalId = toolInput.proposalId ?? fallbackProposalId;
        switch (toolName) {
            case 'create_proposal':
                return this.handleCreateProposal(toolInput, requestParameters);
            case 'check_status':
                return this.handleCheckStatus(proposalId);
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
            data: result,
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
};
exports.ChatAssistantUseCase = ChatAssistantUseCase;
exports.ChatAssistantUseCase = ChatAssistantUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(8, (0, common_1.Inject)('ChatAssistantModelAdapter')),
    __metadata("design:paramtypes", [create_proposal_use_case_1.CreateProposalUseCase,
        validate_offer_eligibility_use_case_1.ValidateOfferEligibilityUseCase,
        validate_benefits_use_case_1.ValidateBenefitSelectionUseCase,
        submit_proposal_use_case_1.SubmitProposalUseCase,
        create_card_account_use_case_1.CreateCardAccountUseCase,
        activate_benefits_use_case_1.ActivateBenefitsUseCase,
        get_proposal_status_use_case_1.GetProposalStatusUseCase,
        generate_proposal_explanation_use_case_1.GenerateProposalExplanationUseCase, Object])
], ChatAssistantUseCase);
