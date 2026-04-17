import { Repository } from 'typeorm';
import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { ProposalRepository } from '../../application/ports/proposal.repository';
import { ProposalEntity } from '../typeorm/entities/proposal.entity';
export declare class TypeormProposalRepository implements ProposalRepository {
    private readonly repository;
    constructor(repository: Repository<ProposalEntity>);
    private toDomain;
    private toEntity;
    save(proposal: CreditCardProposal): Promise<void>;
    findById(proposalId: string): Promise<CreditCardProposal | null>;
}
