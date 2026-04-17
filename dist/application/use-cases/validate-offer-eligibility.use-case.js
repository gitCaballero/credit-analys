"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateOfferEligibilityUseCase = void 0;
class ValidateOfferEligibilityUseCase {
    constructor(repository, policy, outboxPublisher) {
        this.repository = repository;
        this.policy = policy;
        this.outboxPublisher = outboxPublisher;
    }
    async execute(proposalId) {
        const proposal = await this.repository.findById(proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${proposalId} not found`);
        }
        const result = this.policy.evaluate(proposal.customerProfile, proposal.offerType);
        if (result.approved) {
            proposal.markOfferValidated();
        }
        else {
            proposal.markRejected(result.reasons.join('; '));
        }
        await this.repository.save(proposal);
        await this.outboxPublisher.publish({
            eventType: 'offer.eligibility.calculated',
            aggregateId: proposal.proposalId,
            payload: {
                proposalId: proposal.proposalId,
                approved: result.approved,
                eligibleOffers: result.eligibleOffers,
                rejectedRules: result.rejectedRules,
            },
            occurredAt: new Date().toISOString(),
        });
        return {
            approved: result.approved,
            reasons: result.reasons,
            rejectedRules: result.rejectedRules,
            eligibleOffers: result.eligibleOffers,
        };
    }
}
exports.ValidateOfferEligibilityUseCase = ValidateOfferEligibilityUseCase;
