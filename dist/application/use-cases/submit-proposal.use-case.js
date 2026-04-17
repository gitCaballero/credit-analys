"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitProposalUseCase = void 0;
const proposal_status_enum_1 = require("../../domain/enums/proposal-status.enum");
class SubmitProposalUseCase {
    constructor(repository, outboxPublisher) {
        this.repository = repository;
        this.outboxPublisher = outboxPublisher;
    }
    async execute(proposalId) {
        const proposal = await this.repository.findById(proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${proposalId} not found`);
        }
        if (proposal.status !== proposal_status_enum_1.ProposalStatus.BENEFITS_VALIDATED) {
            throw new Error('Proposal must complete benefits validation before submission');
        }
        proposal.markSubmitted();
        await this.repository.save(proposal);
        await this.outboxPublisher.publish({
            eventType: 'proposal.submitted',
            aggregateId: proposal.proposalId,
            payload: {
                proposalId: proposal.proposalId,
                status: proposal.status,
            },
            occurredAt: new Date().toISOString(),
        });
        return {
            proposalId: proposal.proposalId,
            status: proposal.status,
        };
    }
}
exports.SubmitProposalUseCase = SubmitProposalUseCase;
