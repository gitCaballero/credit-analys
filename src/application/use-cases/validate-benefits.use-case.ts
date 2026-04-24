import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { ProposalStatus } from '../../domain/enums/proposal-status.enum';
import { BenefitEligibilityPolicy } from '../../domain/policies/benefit-eligibility.policy';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { ProposalRepository } from '../ports/outbound/proposal.repository.port';

export class ValidateBenefitSelectionUseCase {
  constructor(
    private readonly repository: ProposalRepository,
    private readonly policy: BenefitEligibilityPolicy,
    private readonly outboxPublisher: OutboxEventPublisher,
  ) {}

  async execute(proposalId: string, selectedBenefits: BenefitType[]): Promise<{
    approved: boolean;
    reasons: string[];
    rejectedRules: string[];
    eligibleBenefits: string[];
  }> {
    const proposal = await this.repository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== ProposalStatus.OFFER_VALIDATED) {
      throw new Error('Proposal must complete offer validation before benefits validation');
    }

    proposal.updateSelectedBenefits(selectedBenefits);
    const result = this.policy.evaluate(proposal.offerType, proposal.selectedBenefits.benefits);
    if (result.approved) {
      proposal.markBenefitsValidated();
    } else {
      proposal.markRejected(result.reasons.join('; '));
    }

    await this.repository.save(proposal);
    await this.outboxPublisher.publish({
      eventType: 'benefits.selection.validated',
      aggregateId: proposal.proposalId,
      payload: {
        proposalId: proposal.proposalId,
        approved: result.approved,
        eligibleBenefits: result.eligibleBenefits,
        rejectedRules: result.rejectedRules,
      },
      occurredAt: new Date().toISOString(),
    });

    return {
      approved: result.approved,
      reasons: result.reasons,
      rejectedRules: result.rejectedRules,
      eligibleBenefits: result.eligibleBenefits,
    };
  }
}
