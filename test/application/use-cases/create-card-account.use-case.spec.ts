import { CreateProposalUseCase } from '../../../src/application/use-cases/create-proposal.use-case';
import { CreateCardAccountUseCase } from '../../../src/application/use-cases/create-card-account.use-case';
import { InMemoryProposalRepository } from '../../../src/infrastructure/repositories/in-memory-proposal.repository';
import { FakeCardAccountAdapter } from '../../../src/infrastructure/adapters/fake-card-account.adapter';
import { OutboxEventPublisher } from '../../../src/application/services/outbox-event.publisher';
import { ProposalStatus } from '../../../src/domain/enums/proposal-status.enum';

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
    const updatedProposal = await repository.findById('proposal-2');

    expect(result.cardId).toBe('CARD-proposal-2');
    expect(result.status).toBe('CREATED');
    expect(updatedProposal?.status).toBe(ProposalStatus.CARD_ACCOUNT_CREATED);
    expect(publisher.events.some((event) => event.eventType === 'card.created')).toBe(true);
  });

  it('allows retry after a technical card creation failure', async () => {
    const proposal = await createProposalUseCase.execute({
      proposalId: 'proposal-3',
      customerProfile: {
        fullName: 'Retry Doe',
        nationalId: '11110000',
        income: 18000,
        investments: 7000,
        currentAccountYears: 5,
        email: 'retry@example.com',
      },
      offerType: 'B' as any,
      selectedBenefits: [],
    });
    proposal.markOfferValidated();
    proposal.markBenefitsValidated();
    proposal.markSubmitted();
    proposal.markCardCreationRequested();
    proposal.markCardCreationFailed('Downstream timeout');
    await repository.save(proposal);

    const result = await createCardAccountUseCase.execute('proposal-3');
    const updatedProposal = await repository.findById('proposal-3');

    expect(result.status).toBe('CREATED');
    expect(updatedProposal?.status).toBe(ProposalStatus.CARD_ACCOUNT_CREATED);
  });
});
