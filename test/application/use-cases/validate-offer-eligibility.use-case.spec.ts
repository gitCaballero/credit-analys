import { CreateProposalUseCase } from '../../../src/application/use-cases/create-proposal.use-case';
import { ValidateOfferEligibilityUseCase } from '../../../src/application/use-cases/validate-offer-eligibility.use-case';
import { InMemoryProposalRepository } from '../../../src/infrastructure/repositories/in-memory-proposal.repository';
import { OutboxEventPublisher } from '../../../src/application/services/outbox-event.publisher';
import { OfferEligibilityPolicy } from '../../../src/domain/policies/offer-eligibility.policy';
import { ProposalStatus } from '../../../src/domain/enums/proposal-status.enum';

class DummyPublisher extends OutboxEventPublisher {
  public events: any[] = [];

  async publish(event: any) {
    this.events.push(event);
  }
}

describe('ValidateOfferEligibilityUseCase', () => {
  const repository = new InMemoryProposalRepository();
  const publisher = new DummyPublisher(repository as any);
  const createProposalUseCase = new CreateProposalUseCase(repository, publisher as any);
  const useCase = new ValidateOfferEligibilityUseCase(
    repository,
    new OfferEligibilityPolicy(),
    publisher as any,
  );

  beforeEach(() => {
    publisher.events = [];
  });

  it('approves the proposal when the selected offer is eligible', async () => {
    await createProposalUseCase.execute({
      proposalId: 'proposal-offer-1',
      customerProfile: {
        fullName: 'Jane Doe',
        nationalId: '12345678',
        income: 20000,
        investments: 7000,
        currentAccountYears: 3,
        email: 'jane@example.com',
      },
      offerType: 'B' as any,
      selectedBenefits: [],
    });

    const result = await useCase.execute('proposal-offer-1');
    const updatedProposal = await repository.findById('proposal-offer-1');

    expect(result.approved).toBe(true);
    expect(result.eligibleOffers).toContain('B');
    expect(updatedProposal?.status).toBe(ProposalStatus.OFFER_VALIDATED);
    expect(publisher.events[1].eventType).toBe('offer.eligibility.calculated');
  });

  it('rejects the proposal when the selected offer is not eligible', async () => {
    await createProposalUseCase.execute({
      proposalId: 'proposal-offer-2',
      customerProfile: {
        fullName: 'John Doe',
        nationalId: '87654321',
        income: 2500,
        investments: 100,
        currentAccountYears: 1,
        email: 'john@example.com',
      },
      offerType: 'C' as any,
      selectedBenefits: [],
    });

    const result = await useCase.execute('proposal-offer-2');
    const updatedProposal = await repository.findById('proposal-offer-2');

    expect(result.approved).toBe(false);
    expect(result.eligibleOffers).toContain('A');
    expect(result.reasons).toContain('Customer is not eligible for selected offer C');
    expect(updatedProposal?.status).toBe(ProposalStatus.REJECTED);
  });
});
