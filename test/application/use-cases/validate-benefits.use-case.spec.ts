import { CreateProposalUseCase } from '../../../src/application/use-cases/create-proposal.use-case';
import { ValidateBenefitSelectionUseCase } from '../../../src/application/use-cases/validate-benefits.use-case';
import { InMemoryProposalRepository } from '../../../src/infrastructure/repositories/in-memory-proposal.repository';
import { OutboxEventPublisher } from '../../../src/application/services/outbox-event.publisher';
import { BenefitEligibilityPolicy } from '../../../src/domain/policies/benefit-eligibility.policy';
import { BenefitType } from '../../../src/domain/enums/benefit-type.enum';
import { ProposalStatus } from '../../../src/domain/enums/proposal-status.enum';

class DummyPublisher extends OutboxEventPublisher {
  public events: any[] = [];

  async publish(event: any) {
    this.events.push(event);
  }
}

describe('ValidateBenefitSelectionUseCase', () => {
  const repository = new InMemoryProposalRepository();
  const publisher = new DummyPublisher(repository as any);
  const createProposalUseCase = new CreateProposalUseCase(repository, publisher as any);
  const useCase = new ValidateBenefitSelectionUseCase(
    repository,
    new BenefitEligibilityPolicy(),
    publisher as any,
  );

  beforeEach(() => {
    publisher.events = [];
  });

  it('approves eligible benefits and updates proposal status', async () => {
    await createProposalUseCase.execute({
      proposalId: 'proposal-benefits-1',
      customerProfile: {
        fullName: 'Ana Doe',
        nationalId: '11112222',
        income: 3000,
        investments: 500,
        currentAccountYears: 2,
        email: 'ana@example.com',
      },
      offerType: 'A' as any,
      selectedBenefits: [],
    });

    const result = await useCase.execute('proposal-benefits-1', [BenefitType.CASHBACK]);
    const updatedProposal = await repository.findById('proposal-benefits-1');

    expect(result.approved).toBe(true);
    expect(result.eligibleBenefits).toEqual([BenefitType.CASHBACK]);
    expect(updatedProposal?.status).toBe(ProposalStatus.BENEFITS_VALIDATED);
    expect(updatedProposal?.selectedBenefits.benefits).toEqual([BenefitType.CASHBACK]);
    expect(publisher.events[1].eventType).toBe('benefits.selection.validated');
  });

  it('rejects benefits that are not eligible for the selected offer', async () => {
    await createProposalUseCase.execute({
      proposalId: 'proposal-benefits-2',
      customerProfile: {
        fullName: 'Luis Doe',
        nationalId: '33334444',
        income: 5000,
        investments: 700,
        currentAccountYears: 2,
        email: 'luis@example.com',
      },
      offerType: 'A' as any,
      selectedBenefits: [],
    });

    const result = await useCase.execute('proposal-benefits-2', [BenefitType.TRAVEL_INSURANCE]);
    const updatedProposal = await repository.findById('proposal-benefits-2');

    expect(result.approved).toBe(false);
    expect(result.rejectedRules).toContain('Travel insurance is only available for offer C');
    expect(updatedProposal?.status).toBe(ProposalStatus.REJECTED);
    expect(updatedProposal?.selectedBenefits.benefits).toEqual([BenefitType.TRAVEL_INSURANCE]);
  });
});
