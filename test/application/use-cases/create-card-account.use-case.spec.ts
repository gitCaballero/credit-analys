import { CreateProposalUseCase } from '../../../src/application/use-cases/create-proposal.use-case';
import { CreateCardAccountUseCase } from '../../../src/application/use-cases/create-card-account.use-case';
import { InMemoryProposalRepository } from '../../../src/infrastructure/repositories/in-memory-proposal.repository';
import { FakeCardAccountAdapter } from '../../../src/infrastructure/adapters/fake-card-account.adapter';
import { OutboxEventPublisher } from '../../../src/application/services/outbox-event.publisher';

class DummyPublisher extends OutboxEventPublisher {
  public events: any[] = [];
  async publish(event: any) {
    this.events.push(event);
  }
}

describe('CreateCardAccountUseCase', () => {
  const repository = new InMemoryProposalRepository();
  const publisher = new DummyPublisher(repository as any);
  const createProposalUseCase = new CreateProposalUseCase(repository, publisher as any);
  const cardAdapter = new FakeCardAccountAdapter();
  const createCardAccountUseCase = new CreateCardAccountUseCase(repository, cardAdapter, publisher);

  it('creates card account after proposal submission', async () => {
    const command = {
      proposalId: 'proposal-2',
      customerProfile: {
        fullName: 'Jane Doe',
        nationalId: '87654321',
        income: 20000,
        investments: 6000,
        currentAccountYears: 3,
        email: 'jane@example.com',
      },
      offerType: 'B' as any,
      selectedBenefits: [],
    };
    const proposal = await createProposalUseCase.execute(command);
    proposal.markOfferValidated();
    proposal.markBenefitsValidated();
    proposal.markSubmitted();
    await repository.save(proposal);

    const result = await createCardAccountUseCase.execute('proposal-2');

    expect(result.cardId).toBe('CARD-proposal-2');
    expect(result.status).toBe('CREATED');
    expect(publisher.events.some((event) => event.eventType === 'card.created')).toBe(true);
  });
});
