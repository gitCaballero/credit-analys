"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProposalUseCase = void 0;
const credit_card_proposal_entity_1 = require("../../domain/entities/credit-card-proposal.entity");
const customer_profile_entity_1 = require("../../domain/entities/customer-profile.entity");
class CreateProposalUseCase {
    constructor(repository, outboxPublisher) {
        this.repository = repository;
        this.outboxPublisher = outboxPublisher;
    }
    async execute(command) {
        const profile = new customer_profile_entity_1.CustomerProfile(command.customerProfile.fullName, command.customerProfile.nationalId, command.customerProfile.income, command.customerProfile.investments, command.customerProfile.currentAccountYears, command.customerProfile.email);
        const proposal = new credit_card_proposal_entity_1.CreditCardProposal(command.proposalId, profile, command.offerType, command.selectedBenefits);
        proposal.addAudit('proposal.created', 'Proposal entity created');
        await this.repository.save(proposal);
        await this.outboxPublisher.publish({
            eventType: 'proposal.received',
            aggregateId: proposal.proposalId,
            payload: {
                proposalId: proposal.proposalId,
                offerType: proposal.offerType,
                selectedBenefits: proposal.selectedBenefits.benefits,
            },
            occurredAt: new Date().toISOString(),
        });
        return proposal;
    }
}
exports.CreateProposalUseCase = CreateProposalUseCase;
