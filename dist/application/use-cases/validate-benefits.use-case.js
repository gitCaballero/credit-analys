"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateBenefitSelectionUseCase = void 0;
class ValidateBenefitSelectionUseCase {
    constructor(repository, policy, outboxPublisher) {
        this.repository = repository;
        this.policy = policy;
        this.outboxPublisher = outboxPublisher;
    }
    async execute(proposalId, selectedBenefits) {
        const proposal = await this.repository.findById(proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${proposalId} not found`);
        }
        proposal.updateSelectedBenefits(selectedBenefits);
        const result = this.policy.evaluate(proposal.offerType, proposal.selectedBenefits.benefits);
        if (result.approved) {
            proposal.markBenefitsValidated();
        }
        else {
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
exports.ValidateBenefitSelectionUseCase = ValidateBenefitSelectionUseCase;
