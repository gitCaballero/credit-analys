import { CreateProposalUseCase } from '../../../src/application/use-cases/create-proposal.use-case';
import { ActivateBenefitsUseCase } from '../../../src/application/use-cases/activate-benefits.use-case';
import { InMemoryProposalRepository } from '../../../src/infrastructure/repositories/in-memory-proposal.repository';
import { OutboxEventPublisher } from '../../../src/application/services/outbox-event.publisher';
import {
  BenefitActivationResponse,
  BenefitsPort,
} from '../../../src/application/ports/outbound/benefits.port';
import { BenefitType } from '../../../src/domain/enums/benefit-type.enum';
import { BenefitActivationStatus } from '../../../src/domain/enums/benefit-activation-status.enum';
import { CardCreationStatus } from '../../../src/domain/enums/card-creation-status.enum';
import { ProposalStatus } from '../../../src/domain/enums/proposal-status.enum';

class DummyPublisher extends OutboxEventPublisher {
  public events: any[] = [];

  async publish(event: any) {
    this.events.push(event);
  }
}

class StubBenefitsAdapter implements BenefitsPort {
  constructor(private readonly responses: Record<string, BenefitActivationResponse>) {}

  async activateBenefit(payload: { proposalId: string; cardId: string; benefit: BenefitType }) {
    return this.responses[payload.benefit];
  }
}

describe('ActivateBenefitsUseCase', () => {
  const repository = new InMemoryProposalRepository();
  const publisher = new DummyPublisher(repository as any);
  const createProposalUseCase = new CreateProposalUseCase(repository, publisher as any);

  beforeEach(() => {
    publisher.events = [];
  });

  it('completes the proposal when all benefits are activated', async () => {
    const proposal = await createProposalUseCase.execute({
      proposalId: 'proposal-activation-1',
      customerProfile: {
        fullName: 'Eva Doe',
        nationalId: '55556666',
        income: 5000,
        investments: 2500,
        currentAccountYears: 3,
        email: 'eva@example.com',
      },
      offerType: 'A' as any,
      selectedBenefits: [BenefitType.CASHBACK],
    });

    proposal.markOfferValidated();
    proposal.markBenefitsValidated();
    proposal.markSubmitted();
    proposal.markCardCreationRequested();
    proposal.markCardCreated('CARD-proposal-activation-1');
    await repository.save(proposal);

    const useCase = new ActivateBenefitsUseCase(
      repository,
      new StubBenefitsAdapter({
        [BenefitType.CASHBACK]: { success: true, benefit: BenefitType.CASHBACK },
      }),
      publisher as any,
    );

    const result = await useCase.execute('proposal-activation-1');
    const updatedProposal = await repository.findById('proposal-activation-1');

    expect(result.completed).toBe(true);
    expect(result.statuses[BenefitType.CASHBACK]).toBe(BenefitActivationStatus.ACTIVATED);
    expect(updatedProposal?.status).toBe(ProposalStatus.COMPLETED);
    expect(publisher.events[1].eventType).toBe('benefits.activated');
  });

  it('keeps the proposal open when at least one benefit activation fails', async () => {
    const proposal = await createProposalUseCase.execute({
      proposalId: 'proposal-activation-2',
      customerProfile: {
        fullName: 'Noa Doe',
        nationalId: '77778888',
        income: 60000,
        investments: 15000,
        currentAccountYears: 5,
        email: 'noa@example.com',
      },
      offerType: 'C' as any,
      selectedBenefits: [BenefitType.CASHBACK, BenefitType.TRAVEL_INSURANCE],
    });

    proposal.markOfferValidated();
    proposal.markBenefitsValidated();
    proposal.markSubmitted();
    proposal.markCardCreationRequested();
    proposal.markCardCreated('CARD-proposal-activation-2');
    await repository.save(proposal);

    const useCase = new ActivateBenefitsUseCase(
      repository,
      new StubBenefitsAdapter({
        [BenefitType.CASHBACK]: { success: true, benefit: BenefitType.CASHBACK },
        [BenefitType.TRAVEL_INSURANCE]: {
          success: false,
          benefit: BenefitType.TRAVEL_INSURANCE,
          reason: 'Partner timeout',
        },
      }),
      publisher as any,
    );

    const result = await useCase.execute('proposal-activation-2');
    const updatedProposal = await repository.findById('proposal-activation-2');

    expect(result.completed).toBe(false);
    expect(result.statuses[BenefitType.CASHBACK]).toBe(BenefitActivationStatus.ACTIVATED);
    expect(result.statuses[BenefitType.TRAVEL_INSURANCE]).toBe(BenefitActivationStatus.FAILED);
    expect(updatedProposal?.status).toBe(ProposalStatus.CARD_ACCOUNT_CREATED);
    expect(updatedProposal?.cardCreationStatus).toBe(CardCreationStatus.CREATED);
  });

  it('rejects activation when card status is not fully created', async () => {
    const proposal = await createProposalUseCase.execute({
      proposalId: 'proposal-activation-3',
      customerProfile: {
        fullName: 'Kai Doe',
        nationalId: '12121212',
        income: 9000,
        investments: 800,
        currentAccountYears: 2,
        email: 'kai@example.com',
      },
      offerType: 'A' as any,
      selectedBenefits: [BenefitType.CASHBACK],
    });

    proposal.markOfferValidated();
    proposal.markBenefitsValidated();
    proposal.markSubmitted();
    await repository.save(proposal);

    const useCase = new ActivateBenefitsUseCase(
      repository,
      new StubBenefitsAdapter({
        [BenefitType.CASHBACK]: { success: true, benefit: BenefitType.CASHBACK },
      }),
      publisher as any,
    );

    await expect(useCase.execute('proposal-activation-3')).rejects.toThrow(
      'Proposal must have a created card account before benefits activation',
    );
  });
});
