import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { ProposalRepository } from '../../application/ports/proposal.repository';
export declare class InMemoryProposalRepository implements ProposalRepository {
    private readonly store;
    save(proposal: CreditCardProposal): Promise<void>;
    findById(proposalId: string): Promise<CreditCardProposal | null>;
}
