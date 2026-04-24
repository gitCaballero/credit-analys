import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssistantController } from '../../adapters/inbound/http/controllers/assistant.controller';
import { ProposalController } from '../../adapters/inbound/http/controllers/proposal.controller';
import { ProposalService } from '../../adapters/inbound/http/services/proposal.service';
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
import { ListProposalsUseCase } from '../../application/use-cases/list-proposals.use-case';
import { ValidateBenefitSelectionUseCase } from '../../application/use-cases/validate-benefits.use-case';
import { ValidateOfferEligibilityUseCase } from '../../application/use-cases/validate-offer-eligibility.use-case';
import { OfferEligibilityPolicy } from '../../domain/policies/offer-eligibility.policy';
import { BenefitEligibilityPolicy } from '../../domain/policies/benefit-eligibility.policy';
import { OutboxEventPublisher } from '../../application/services/outbox-event.publisher';
import { ProposalRepository } from '../../application/ports/outbound/proposal.repository.port';
import { CardAccountPort } from '../../application/ports/outbound/card-account.port';
import { BenefitsPort } from '../../application/ports/outbound/benefits.port';
import { AiAssistantService } from '../../application/services/ai-assistant.service';
import { CreateCardAccountUseCase } from '../../application/use-cases/create-card-account.use-case';
import { ActivateBenefitsUseCase } from '../../application/use-cases/activate-benefits.use-case';
import { SubmitProposalUseCase } from '../../application/use-cases/submit-proposal.use-case';
import { GenerateProposalExplanationUseCase } from '../../application/use-cases/generate-proposal-explanation.use-case';
import { ChatAssistantUseCase } from '../../application/use-cases/chat-assistant.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ProposalEntity, OutboxEventEntity])],
  controllers: [ProposalController, AssistantController],
  providers: [
    ProposalService,
    ChatAssistantUseCase,
    {
      provide: 'AssistantWorkflowPort',
      useExisting: ChatAssistantUseCase,
    },
    {
      provide: 'ProposalWorkflowPort',
      useExisting: ProposalService,
    },
    {
      provide: 'ProposalRepositoryPort',
      useClass: TypeormProposalRepository,
    },
    {
      provide: 'OutboxEventRepositoryPort',
      useClass: TypeormOutboxRepository,
    },
    OfferEligibilityPolicy,
    BenefitEligibilityPolicy,
    OutboxEventPublisher,
    {
      provide: CreateProposalUseCase,
      useFactory: (repository: ProposalRepository, publisher: OutboxEventPublisher) =>
        new CreateProposalUseCase(repository, publisher),
      inject: ['ProposalRepositoryPort', OutboxEventPublisher],
    },
    {
      provide: ValidateOfferEligibilityUseCase,
      useFactory: (
        repository: ProposalRepository,
        policy: OfferEligibilityPolicy,
        publisher: OutboxEventPublisher,
      ) => new ValidateOfferEligibilityUseCase(repository, policy, publisher),
      inject: ['ProposalRepositoryPort', OfferEligibilityPolicy, OutboxEventPublisher],
    },
    {
      provide: ValidateBenefitSelectionUseCase,
      useFactory: (
        repository: ProposalRepository,
        policy: BenefitEligibilityPolicy,
        publisher: OutboxEventPublisher,
      ) => new ValidateBenefitSelectionUseCase(repository, policy, publisher),
      inject: ['ProposalRepositoryPort', BenefitEligibilityPolicy, OutboxEventPublisher],
    },
    {
      provide: SubmitProposalUseCase,
      useFactory: (repository: ProposalRepository, publisher: OutboxEventPublisher) =>
        new SubmitProposalUseCase(repository, publisher),
      inject: ['ProposalRepositoryPort', OutboxEventPublisher],
    },
    {
      provide: 'CardAccountPort',
      useClass: FakeCardAccountAdapter,
    },
    {
      provide: 'BenefitsPort',
      useClass: FakeBenefitsAdapter,
    },
    {
      provide: 'AiAssistantPort',
      useClass: FakeAiAssistantAdapter,
    },
    AiAssistantService,
    {
      provide: 'ChatAssistantModelPort',
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
        cardAccountPort: CardAccountPort,
        publisher: OutboxEventPublisher,
      ) => new CreateCardAccountUseCase(repository, cardAccountPort, publisher),
      inject: ['ProposalRepositoryPort', 'CardAccountPort', OutboxEventPublisher],
    },
    {
      provide: ActivateBenefitsUseCase,
      useFactory: (
        repository: ProposalRepository,
        benefitsPort: BenefitsPort,
        publisher: OutboxEventPublisher,
      ) => new ActivateBenefitsUseCase(repository, benefitsPort, publisher),
      inject: ['ProposalRepositoryPort', 'BenefitsPort', OutboxEventPublisher],
    },
    {
      provide: GenerateProposalExplanationUseCase,
      useFactory: (
        repository: ProposalRepository,
        assistant: AiAssistantService,
      ) => new GenerateProposalExplanationUseCase(repository, assistant),
      inject: ['ProposalRepositoryPort', AiAssistantService],
    },
    {
      provide: GetProposalStatusUseCase,
      useFactory: (repository: ProposalRepository) => new GetProposalStatusUseCase(repository),
      inject: ['ProposalRepositoryPort'],
    },
    {
      provide: ListProposalsUseCase,
      useFactory: (repository: ProposalRepository) => new ListProposalsUseCase(repository),
      inject: ['ProposalRepositoryPort'],
    },
  ],
})
export class ProposalModule {}
