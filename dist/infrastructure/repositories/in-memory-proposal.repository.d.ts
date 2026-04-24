import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { ProposalRepository } from '../../application/ports/outbound/proposal.repository.port';
export declare class InMemoryProposalRepository implements ProposalRepository {
    private readonly store;
    save(proposal: CreditCardProposal): Promise<void>;
    findById(proposalId: string): Promise<CreditCardProposal | null>;
    findAll(): Promise<CreditCardProposal[]>;
}
