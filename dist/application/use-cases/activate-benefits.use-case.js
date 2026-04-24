"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivateBenefitsUseCase = void 0;
const benefit_activation_status_enum_1 = require("../../domain/enums/benefit-activation-status.enum");
const card_creation_status_enum_1 = require("../../domain/enums/card-creation-status.enum");
const proposal_status_enum_1 = require("../../domain/enums/proposal-status.enum");
class ActivateBenefitsUseCase {
    constructor(repository, benefitsPort, outboxPublisher) {
        this.repository = repository;
        this.benefitsPort = benefitsPort;
        this.outboxPublisher = outboxPublisher;
    }
    async execute(proposalId) {
        const proposal = await this.repository.findById(proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${proposalId} not found`);
        }
        if (proposal.status !== proposal_status_enum_1.ProposalStatus.CARD_ACCOUNT_CREATED) {
            throw new Error('Proposal must have a created card account before benefits activation');
        }
        if (proposal.cardCreationStatus !== card_creation_status_enum_1.CardCreationStatus.CREATED) {
            throw new Error('Card account must be created before benefits activation');
        }
        const activationResults = await Promise.all(proposal.selectedBenefits.benefits.map(async (benefit) => {
            const result = await this.benefitsPort.activateBenefit({
                proposalId: proposal.proposalId,
                cardId: proposal.cardId,
                benefit,
            });
            proposal.setBenefitActivationStatus(benefit, result.success ? benefit_activation_status_enum_1.BenefitActivationStatus.ACTIVATED : benefit_activation_status_enum_1.BenefitActivationStatus.FAILED);
            return result;
        }));
        const allActivated = activationResults.every((result) => result.success);
        if (allActivated) {
            proposal.markCompleted();
        }
        await this.repository.save(proposal);
        await this.outboxPublisher.publish({
            eventType: 'benefits.activated',
            aggregateId: proposal.proposalId,
            payload: {
                proposalId: proposal.proposalId,
                activationResults: activationResults.map((result) => ({
                    benefit: result.benefit,
                    success: result.success,
                    reason: result.reason,
                })),
            },
            occurredAt: new Date().toISOString(),
        });
        return {
            proposalId: proposal.proposalId,
            cardId: proposal.cardId,
            statuses: proposal.benefitActivationStatus,
            completed: allActivated,
        };
    }
}
exports.ActivateBenefitsUseCase = ActivateBenefitsUseCase;
