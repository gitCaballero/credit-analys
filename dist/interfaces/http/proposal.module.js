"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const assistant_controller_1 = require("./controllers/assistant.controller");
const proposal_controller_1 = require("./controllers/proposal.controller");
const proposal_service_1 = require("./services/proposal.service");
const typeorm_proposal_repository_1 = require("../../infrastructure/repositories/typeorm-proposal.repository");
const typeorm_outbox_repository_1 = require("../../infrastructure/repositories/typeorm-outbox.repository");
const fake_card_account_adapter_1 = require("../../infrastructure/adapters/fake-card-account.adapter");
const fake_benefits_adapter_1 = require("../../infrastructure/adapters/fake-benefits.adapter");
const fake_ai_assistant_adapter_1 = require("../../infrastructure/adapters/fake-ai-assistant.adapter");
const fake_chat_model_adapter_1 = require("../../infrastructure/adapters/fake-chat-model.adapter");
const openai_chat_model_adapter_1 = require("../../infrastructure/adapters/openai-chat-model.adapter");
const outbox_event_entity_1 = require("../../infrastructure/typeorm/entities/outbox-event.entity");
const proposal_entity_1 = require("../../infrastructure/typeorm/entities/proposal.entity");
const create_proposal_use_case_1 = require("../../application/use-cases/create-proposal.use-case");
const get_proposal_status_use_case_1 = require("../../application/use-cases/get-proposal-status.use-case");
const validate_benefits_use_case_1 = require("../../application/use-cases/validate-benefits.use-case");
const validate_offer_eligibility_use_case_1 = require("../../application/use-cases/validate-offer-eligibility.use-case");
const offer_eligibility_policy_1 = require("../../domain/policies/offer-eligibility.policy");
const benefit_eligibility_policy_1 = require("../../domain/policies/benefit-eligibility.policy");
const outbox_event_publisher_1 = require("../../application/services/outbox-event.publisher");
const ai_assistant_service_1 = require("../../application/services/ai-assistant.service");
const create_card_account_use_case_1 = require("../../application/use-cases/create-card-account.use-case");
const activate_benefits_use_case_1 = require("../../application/use-cases/activate-benefits.use-case");
const submit_proposal_use_case_1 = require("../../application/use-cases/submit-proposal.use-case");
const generate_proposal_explanation_use_case_1 = require("../../application/use-cases/generate-proposal-explanation.use-case");
const chat_assistant_use_case_1 = require("../../application/use-cases/chat-assistant.use-case");
let ProposalModule = class ProposalModule {
};
exports.ProposalModule = ProposalModule;
exports.ProposalModule = ProposalModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([proposal_entity_1.ProposalEntity, outbox_event_entity_1.OutboxEventEntity])],
        controllers: [proposal_controller_1.ProposalController, assistant_controller_1.AssistantController],
        providers: [
            proposal_service_1.ProposalService,
            chat_assistant_use_case_1.ChatAssistantUseCase,
            {
                provide: 'ProposalRepository',
                useClass: typeorm_proposal_repository_1.TypeormProposalRepository,
            },
            {
                provide: 'OutboxEventRepository',
                useClass: typeorm_outbox_repository_1.TypeormOutboxRepository,
            },
            offer_eligibility_policy_1.OfferEligibilityPolicy,
            benefit_eligibility_policy_1.BenefitEligibilityPolicy,
            outbox_event_publisher_1.OutboxEventPublisher,
            {
                provide: create_proposal_use_case_1.CreateProposalUseCase,
                useFactory: (repository, publisher) => new create_proposal_use_case_1.CreateProposalUseCase(repository, publisher),
                inject: ['ProposalRepository', outbox_event_publisher_1.OutboxEventPublisher],
            },
            {
                provide: validate_offer_eligibility_use_case_1.ValidateOfferEligibilityUseCase,
                useFactory: (repository, policy, publisher) => new validate_offer_eligibility_use_case_1.ValidateOfferEligibilityUseCase(repository, policy, publisher),
                inject: ['ProposalRepository', offer_eligibility_policy_1.OfferEligibilityPolicy, outbox_event_publisher_1.OutboxEventPublisher],
            },
            {
                provide: validate_benefits_use_case_1.ValidateBenefitSelectionUseCase,
                useFactory: (repository, policy, publisher) => new validate_benefits_use_case_1.ValidateBenefitSelectionUseCase(repository, policy, publisher),
                inject: ['ProposalRepository', benefit_eligibility_policy_1.BenefitEligibilityPolicy, outbox_event_publisher_1.OutboxEventPublisher],
            },
            {
                provide: submit_proposal_use_case_1.SubmitProposalUseCase,
                useFactory: (repository, publisher) => new submit_proposal_use_case_1.SubmitProposalUseCase(repository, publisher),
                inject: ['ProposalRepository', outbox_event_publisher_1.OutboxEventPublisher],
            },
            {
                provide: 'CardAccountAdapter',
                useClass: fake_card_account_adapter_1.FakeCardAccountAdapter,
            },
            {
                provide: 'BenefitsAdapter',
                useClass: fake_benefits_adapter_1.FakeBenefitsAdapter,
            },
            {
                provide: 'AiAssistantAdapter',
                useClass: fake_ai_assistant_adapter_1.FakeAiAssistantAdapter,
            },
            ai_assistant_service_1.AiAssistantService,
            {
                provide: 'ChatAssistantModelAdapter',
                useFactory: () => {
                    if (process.env.OPENAI_API_KEY) {
                        return new openai_chat_model_adapter_1.OpenAiChatModelAdapter();
                    }
                    return new fake_chat_model_adapter_1.FakeChatModelAdapter();
                },
            },
            {
                provide: create_card_account_use_case_1.CreateCardAccountUseCase,
                useFactory: (repository, adapter, publisher) => new create_card_account_use_case_1.CreateCardAccountUseCase(repository, adapter, publisher),
                inject: ['ProposalRepository', 'CardAccountAdapter', outbox_event_publisher_1.OutboxEventPublisher],
            },
            {
                provide: activate_benefits_use_case_1.ActivateBenefitsUseCase,
                useFactory: (repository, adapter, publisher) => new activate_benefits_use_case_1.ActivateBenefitsUseCase(repository, adapter, publisher),
                inject: ['ProposalRepository', 'BenefitsAdapter', outbox_event_publisher_1.OutboxEventPublisher],
            },
            {
                provide: generate_proposal_explanation_use_case_1.GenerateProposalExplanationUseCase,
                useFactory: (repository, assistant) => new generate_proposal_explanation_use_case_1.GenerateProposalExplanationUseCase(repository, assistant),
                inject: ['ProposalRepository', ai_assistant_service_1.AiAssistantService],
            },
            {
                provide: get_proposal_status_use_case_1.GetProposalStatusUseCase,
                useFactory: (repository) => new get_proposal_status_use_case_1.GetProposalStatusUseCase(repository),
                inject: ['ProposalRepository'],
            },
        ],
    })
], ProposalModule);
