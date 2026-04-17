import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { BenefitEligibilityPolicy } from '../../domain/policies/benefit-eligibility.policy';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { ProposalRepository } from '../ports/proposal.repository';
export declare class ValidateBenefitSelectionUseCase {
    private readonly repository;
    private readonly policy;
    private readonly outboxPublisher;
    constructor(repository: ProposalRepository, policy: BenefitEligibilityPolicy, outboxPublisher: OutboxEventPublisher);
    execute(proposalId: string, selectedBenefits: BenefitType[]): Promise<{
        approved: boolean;
        reasons: string[];
        rejectedRules: string[];
        eligibleBenefits: string[];
    }>;
}
