import { CreateProposalUseCase } from '../../../src/application/use-cases/create-proposal.use-case';
import { SubmitProposalUseCase } from '../../../src/application/use-cases/submit-proposal.use-case';
import { InMemoryProposalRepository } from '../../../src/infrastructure/repositories/in-memory-proposal.repository';
import { OutboxEventPublisher } from '../../../src/application/services/outbox-event.publisher';

class DummyPublisher extends OutboxEventPublisher {
  public events: any[] = [];
  async publish(event: any) {
    this.events.push(event);
  }
}

describe('SubmitProposalUseCase', () => {
  const repository = new InMemoryProposalRepository();
  const publisher = new DummyPublisher(repository as any);
  const createProposalUseCase = new CreateProposalUseCase(repository, publisher as any);
  const submitProposalUseCase = new SubmitProposalUseCase(repository, publisher);

  it('submits a proposal after benefits validation', async () => {
    const command = {
      proposalId: 'proposal-1',
      customerProfile: {
        fullName: 'John Doe',
        nationalId: '12345678',
        income: 2000,
        investments: 0,
        currentAccountYears: 1,
        email: 'john@example.com',
      },
      offerType: 'A' as any,
      selectedBenefits: [],
    };
    const proposal = await createProposalUseCase.execute(command);
    proposal.markOfferValidated();
    proposal.markBenefitsValidated();
    await repository.save(proposal);

    const result = await submitProposalUseCase.execute('proposal-1');

    expect(result).toEqual({ proposalId: 'proposal-1', status: 'SUBMITTED' });
    expect(publisher.events).toHaveLength(2);
    expect(publisher.events[1].eventType).toBe('proposal.submitted');
  });
});
