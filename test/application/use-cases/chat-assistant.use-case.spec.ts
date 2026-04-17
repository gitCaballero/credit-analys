import { CreateProposalUseCase } from '../../../src/application/use-cases/create-proposal.use-case';
import { GetProposalStatusUseCase } from '../../../src/application/use-cases/get-proposal-status.use-case';
import { ValidateOfferEligibilityUseCase } from '../../../src/application/use-cases/validate-offer-eligibility.use-case';
import { ValidateBenefitSelectionUseCase } from '../../../src/application/use-cases/validate-benefits.use-case';
import { SubmitProposalUseCase } from '../../../src/application/use-cases/submit-proposal.use-case';
import { CreateCardAccountUseCase } from '../../../src/application/use-cases/create-card-account.use-case';
import { ActivateBenefitsUseCase } from '../../../src/application/use-cases/activate-benefits.use-case';
import { GenerateProposalExplanationUseCase } from '../../../src/application/use-cases/generate-proposal-explanation.use-case';
import { ChatAssistantUseCase } from '../../../src/application/use-cases/chat-assistant.use-case';
import { FakeCardAccountAdapter } from '../../../src/infrastructure/adapters/fake-card-account.adapter';
import { FakeBenefitsAdapter } from '../../../src/infrastructure/adapters/fake-benefits.adapter';
import { FakeChatModelAdapter } from '../../../src/infrastructure/adapters/fake-chat-model.adapter';
import { FakeAiAssistantAdapter } from '../../../src/infrastructure/adapters/fake-ai-assistant.adapter';
import { InMemoryProposalRepository } from '../../../src/infrastructure/repositories/in-memory-proposal.repository';
import { OutboxEventPublisher } from '../../../src/application/services/outbox-event.publisher';
import { BenefitEligibilityPolicy } from '../../../src/domain/policies/benefit-eligibility.policy';
import { OfferEligibilityPolicy } from '../../../src/domain/policies/offer-eligibility.policy';
import { BenefitType } from '../../../src/domain/enums/benefit-type.enum';
import { ChatAssistantModelAdapter } from '../../../src/application/ports/chat-assistant.adapter';

class DummyOutboxPublisher extends OutboxEventPublisher {
  public events: any[] = [];

  async publish(event: any) {
    this.events.push(event);
  }
}

describe('ChatAssistantUseCase', () => {
  const repository = new InMemoryProposalRepository();
  const publisher = new DummyOutboxPublisher({} as any);
  const offerPolicy = new OfferEligibilityPolicy();
  const benefitPolicy = new BenefitEligibilityPolicy();
  const createProposalUseCase = new CreateProposalUseCase(repository, publisher as any);
  const validateOfferEligibilityUseCase = new ValidateOfferEligibilityUseCase(repository, offerPolicy, publisher as any);
  const validateBenefitSelectionUseCase = new ValidateBenefitSelectionUseCase(repository, benefitPolicy, publisher as any);
  const submitProposalUseCase = new SubmitProposalUseCase(repository, publisher as any);
  const cardAdapter = new FakeCardAccountAdapter();
  const createCardAccountUseCase = new CreateCardAccountUseCase(repository, cardAdapter, publisher as any);
  const benefitsAdapter = new FakeBenefitsAdapter();
  const activateBenefitsUseCase = new ActivateBenefitsUseCase(repository, benefitsAdapter, publisher as any);
  const aiAssistantAdapter = new FakeAiAssistantAdapter();
  const generateProposalExplanationUseCase = new GenerateProposalExplanationUseCase(repository, { explainProposal: aiAssistantAdapter.generateProposalExplanation.bind(aiAssistantAdapter) } as any);
  const chatModelAdapter = new FakeChatModelAdapter();
  const chatAssistantUseCase = new ChatAssistantUseCase(
    createProposalUseCase,
    validateOfferEligibilityUseCase,
    validateBenefitSelectionUseCase,
    submitProposalUseCase,
    createCardAccountUseCase,
    activateBenefitsUseCase,
    new GetProposalStatusUseCase(repository),
    generateProposalExplanationUseCase,
    chatModelAdapter,
  );

  it('creates a proposal from a chat request', async () => {
    const response = await chatAssistantUseCase.execute({
      userMessage: 'Quiero solicitar un crédito con oferta A y cashback',
      proposalId: 'proposal-chat-1',
      parameters: {
        customerProfile: {
          fullName: 'Carlos López',
          nationalId: '11223344',
          income: 3500,
          investments: 8000,
          currentAccountYears: 2,
          email: 'carlos@example.com',
        },
        offerType: 'A',
        selectedBenefits: [BenefitType.CASHBACK],
      },
    });

    expect(response.toolName).toBe('create_proposal');
    expect(response.toolResult).toHaveProperty('proposalId', 'proposal-chat-1');
    expect(response.toolResult).toHaveProperty('offerType', 'A');
  });

  it('checks proposal status from chat', async () => {
    const response = await chatAssistantUseCase.execute({
      userMessage: 'Consulta el estado de la propuesta',
      proposalId: 'proposal-chat-1',
    });

    expect(response.toolName).toBe('check_status');
    expect(response.toolResult).toHaveProperty('status');
  });

  it('returns a guidance message for unsupported queries', async () => {
    const response = await chatAssistantUseCase.execute({
      userMessage: 'Cuéntame un chiste sobre tarjetas',
    });

    expect(response.toolName).toBeUndefined();
    expect(response.message).toContain('Puedo ayudarte');
  });

  it('uses request parameters when the model omits create_proposal fields', async () => {
    const sparseModelAdapter: ChatAssistantModelAdapter = {
      interpretIntent: jest.fn().mockResolvedValue({
        toolName: 'create_proposal',
        toolInput: {},
        assistantMessage: 'Vamos a crear la propuesta.',
      }),
    };

    const useCaseWithSparseModel = new ChatAssistantUseCase(
      createProposalUseCase,
      validateOfferEligibilityUseCase,
      validateBenefitSelectionUseCase,
      submitProposalUseCase,
      createCardAccountUseCase,
      activateBenefitsUseCase,
      new GetProposalStatusUseCase(repository),
      generateProposalExplanationUseCase,
      sparseModelAdapter,
    );

    const response = await useCaseWithSparseModel.execute({
      userMessage: 'Quiero solicitar un crédito',
      proposalId: 'proposal-chat-2',
      parameters: {
        proposalId: 'proposal-chat-2',
        customerProfile: {
          fullName: 'Maria Silva',
          nationalId: '99887766',
          income: 7000,
          investments: 1200,
          currentAccountYears: 4,
          email: 'maria@example.com',
        },
        offerType: 'A',
        selectedBenefits: [BenefitType.CASHBACK],
      },
    });

    expect(response.toolName).toBe('create_proposal');
    expect(response.toolResult).toHaveProperty('proposalId', 'proposal-chat-2');
  });
});
