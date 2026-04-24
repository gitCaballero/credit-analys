import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { ProposalRepository } from '../../application/ports/outbound/proposal.repository.port';

export class InMemoryProposalRepository implements ProposalRepository {
  private readonly store: Map<string, CreditCardProposal> = new Map();

  async save(proposal: CreditCardProposal): Promise<void> {
    this.store.set(proposal.proposalId, proposal);
  }

  async findById(proposalId: string): Promise<CreditCardProposal | null> {
    return this.store.get(proposalId) ?? null;
  }

  async findAll(): Promise<CreditCardProposal[]> {
    return Array.from(this.store.values());
  }
}
