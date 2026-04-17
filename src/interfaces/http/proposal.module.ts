import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssistantController } from './controllers/assistant.controller';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalService } from './services/proposal.service';
import { TypeormProposalRepository } from '../../infrastructure/repositories/typeorm-proposal.repository';
import { TypeormOutboxRepository } from '../../infrastructure/repositories/typeorm-outbox.repository';
import { FakeCardAccountAdapter } from '../../infrastructure/adapters/fake-card-account.adapter';
import { FakeBenefitsAdapter } from '../../infrastructure/adapters/fake-benefits.adapter';
import { FakeAiAssistantAdapter } from '../../infrastructure/adapters/fake-ai-assistant.adapter';
import { FakeChatModelAdapter } from '../../infrastructure/adapters/fake-chat-model.adapter';
import { OpenAiChatModelAdapter } from '../../infrastructure/adapters/openai-chat-model.adapter';
import { OutboxEventEntity } from '../../infrastructure/typeorm/entities/outbox-event.entity';
import { ProposalEntity } from '../../infrastructure/typeorm/entities/proposal.entity';
import { CreateProposalUseCase } from '../../application/use-cases/create-proposal.use-case';
import { GetProposalStatusUseCase } from '../../application/use-cases/get-proposal-status.use-case';
import { ValidateBenefitSelectionUseCase } from '../../application/use-cases/validate-benefits.use-case';
import { ValidateOfferEligibilityUseCase } from '../../application/use-cases/validate-offer-eligibility.use-case';
import { OfferEligibilityPolicy } from '../../domain/policies/offer-eligibility.policy';
import { BenefitEligibilityPolicy } from '../../domain/policies/benefit-eligibility.policy';
import { OutboxEventPublisher } from '../../application/services/outbox-event.publisher';
import { ProposalRepository } from '../../application/ports/proposal.repository';
import { OutboxEventRepository } from '../../application/ports/outbox-event.repository';
import { CardAccountAdapter } from '../../application/ports/card-account.adapter';
import { BenefitsAdapter } from '../../application/ports/benefits.adapter';
import { AiAssistantAdapter } from '../../application/ports/ai-assistant.adapter';
import { AiAssistantService } from '../../application/services/ai-assistant.service';
import { CreateCardAccountUseCase } from '../../application/use-cases/create-card-account.use-case';
import { ActivateBenefitsUseCase } from '../../application/use-cases/activate-benefits.use-case';
import { SubmitProposalUseCase } from '../../application/use-cases/submit-proposal.use-case';
import { GenerateProposalExplanationUseCase } from '../../application/use-cases/generate-proposal-explanation.use-case';
import { ChatAssistantUseCase } from '../../application/use-cases/chat-assistant.use-case';
import { ChatAssistantModelAdapter } from '../../application/ports/chat-assistant.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([ProposalEntity, OutboxEventEntity])],
  controllers: [ProposalController, AssistantController],
  providers: [
    ProposalService,
    ChatAssistantUseCase,
    {
      provide: 'ProposalRepository',
      useClass: TypeormProposalRepository,
    },
    {
      provide: 'OutboxEventRepository',
      useClass: TypeormOutboxRepository,
    },
    OfferEligibilityPolicy,
    BenefitEligibilityPolicy,
    OutboxEventPublisher,
    {
      provide: CreateProposalUseCase,
      useFactory: (repository: ProposalRepository, publisher: OutboxEventPublisher) =>
        new CreateProposalUseCase(repository, publisher),
      inject: ['ProposalRepository', OutboxEventPublisher],
    },
    {
      provide: ValidateOfferEligibilityUseCase,
      useFactory: (
        repository: ProposalRepository,
        policy: OfferEligibilityPolicy,
        publisher: OutboxEventPublisher,
      ) => new ValidateOfferEligibilityUseCase(repository, policy, publisher),
      inject: ['ProposalRepository', OfferEligibilityPolicy, OutboxEventPublisher],
    },
    {
      provide: ValidateBenefitSelectionUseCase,
      useFactory: (
        repository: ProposalRepository,
        policy: BenefitEligibilityPolicy,
        publisher: OutboxEventPublisher,
      ) => new ValidateBenefitSelectionUseCase(repository, policy, publisher),
      inject: ['ProposalRepository', BenefitEligibilityPolicy, OutboxEventPublisher],
    },
    {
      provide: SubmitProposalUseCase,
      useFactory: (repository: ProposalRepository, publisher: OutboxEventPublisher) =>
        new SubmitProposalUseCase(repository, publisher),
      inject: ['ProposalRepository', OutboxEventPublisher],
    },
    {
      provide: 'CardAccountAdapter',
      useClass: FakeCardAccountAdapter,
    },
    {
      provide: 'BenefitsAdapter',
      useClass: FakeBenefitsAdapter,
    },
    {
      provide: 'AiAssistantAdapter',
      useClass: FakeAiAssistantAdapter,
    },
    AiAssistantService,
    {
      provide: 'ChatAssistantModelAdapter',
      useFactory: () => {
        if (process.env.OPENAI_API_KEY) {
          return new OpenAiChatModelAdapter();
        }
        return new FakeChatModelAdapter();
      },
    },
    {
      provide: CreateCardAccountUseCase,
      useFactory: (
        repository: ProposalRepository,
        adapter: CardAccountAdapter,
        publisher: OutboxEventPublisher,
      ) => new CreateCardAccountUseCase(repository, adapter, publisher),
      inject: ['ProposalRepository', 'CardAccountAdapter', OutboxEventPublisher],
    },
    {
      provide: ActivateBenefitsUseCase,
      useFactory: (
        repository: ProposalRepository,
        adapter: BenefitsAdapter,
        publisher: OutboxEventPublisher,
      ) => new ActivateBenefitsUseCase(repository, adapter, publisher),
      inject: ['ProposalRepository', 'BenefitsAdapter', OutboxEventPublisher],
    },
    {
      provide: GenerateProposalExplanationUseCase,
      useFactory: (
        repository: ProposalRepository,
        assistant: AiAssistantService,
      ) => new GenerateProposalExplanationUseCase(repository, assistant),
      inject: ['ProposalRepository', AiAssistantService],
    },
    {
      provide: GetProposalStatusUseCase,
      useFactory: (repository: ProposalRepository) => new GetProposalStatusUseCase(repository),
      inject: ['ProposalRepository'],
    },
  ],
})
export class ProposalModule {}
