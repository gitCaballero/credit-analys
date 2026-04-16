import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';

export interface ProposalRepository {
  save(proposal: CreditCardProposal): Promise<void>;
  findById(proposalId: string): Promise<CreditCardProposal | null>;
}
