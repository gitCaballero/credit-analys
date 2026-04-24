import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { OfferType } from '../../domain/enums/offer-type.enum';
import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
export interface CreateProposalCommand {
    proposalId: string;
    customerProfile: {
        fullName: string;
        nationalId: string;
        income: number;
        investments: number;
        currentAccountYears: number;
        email: string;
    };
    offerType: OfferType;
    selectedBenefits: BenefitType[];
}
export declare class CreateProposalUseCase {
    private readonly repository;
    private readonly outboxPublisher;
    constructor(repository: ProposalRepository, outboxPublisher: OutboxEventPublisher);
    execute(command: CreateProposalCommand): Promise<CreditCardProposal>;
}
