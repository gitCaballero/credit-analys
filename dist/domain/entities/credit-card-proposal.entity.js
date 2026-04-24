"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardProposal = void 0;
const card_creation_status_enum_1 = require("../enums/card-creation-status.enum");
const proposal_status_enum_1 = require("../enums/proposal-status.enum");
const audit_entry_entity_1 = require("./audit-entry.entity");
const benefit_selection_entity_1 = require("./benefit-selection.entity");
/**
 * CreditCardProposal é a raiz de agregado de uma proposta de cartão de crédito.
 * Ela controla a oferta escolhida, os benefícios selecionados, o status, a criação do cartão e o histórico de auditoria.
 */
class CreditCardProposal {
    constructor(
    /** Identificador único da proposta. */
    proposalId, 
    /** Informações financeiras e de contato do cliente. */
    customerProfile, 
    /** Tipo de oferta selecionado pelo cliente. */
    offerType, 
    /** Benefícios selecionados inicialmente. */
    benefits = []) {
        this.proposalId = proposalId;
        this.customerProfile = customerProfile;
        this.offerType = offerType;
        this.selectedBenefits = new benefit_selection_entity_1.BenefitSelection(benefits);
        this.benefitActivationStatus = {};
        this.auditEntries = [];
        this.status = proposal_status_enum_1.ProposalStatus.RECEIVED;
        this.cardCreationStatus = card_creation_status_enum_1.CardCreationStatus.NOT_CREATED;
    }
    assertStatus(allowed, action) {
        if (!allowed.includes(this.status)) {
            throw new Error(`Proposal cannot ${action} while in status ${this.status}`);
        }
    }
    /**
     * Registra uma nova entrada de auditoria para esta proposta.
     */
    addAudit(event, detail, actor) {
        this.auditEntries.push(new audit_entry_entity_1.AuditEntry(event, new Date(), detail, actor));
    }
    /**
     * Marca a proposta como tendo a oferta validada.
     */
    markOfferValidated() {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.RECEIVED], 'validate offer');
        this.status = proposal_status_enum_1.ProposalStatus.OFFER_VALIDATED;
        this.addAudit('offer.validated', `Offer ${this.offerType} validated`);
    }
    /**
     * Marca a proposta como tendo a seleção de benefícios validada.
     */
    markBenefitsValidated() {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.OFFER_VALIDATED], 'validate benefits');
        this.status = proposal_status_enum_1.ProposalStatus.BENEFITS_VALIDATED;
        this.addAudit('benefits.validated', `Benefit selection validated: ${this.selectedBenefits.benefits.join(', ')}`);
    }
    /**
     * Marca a proposta como enviada para processamento.
     */
    markSubmitted() {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.BENEFITS_VALIDATED], 'submit');
        this.status = proposal_status_enum_1.ProposalStatus.SUBMITTED;
        this.addAudit('proposal.submitted', 'Proposal submitted for processing');
    }
    /**
     * Marca a solicitação de criação do cartão como enviada.
     */
    markCardCreationRequested() {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.SUBMITTED], 'request card creation');
        if (this.cardCreationStatus !== card_creation_status_enum_1.CardCreationStatus.NOT_CREATED &&
            this.cardCreationStatus !== card_creation_status_enum_1.CardCreationStatus.FAILED) {
            throw new Error(`Proposal cannot request card creation while card creation is ${this.cardCreationStatus}`);
        }
        this.cardCreationStatus = card_creation_status_enum_1.CardCreationStatus.REQUESTED;
        this.addAudit('card.creation.requested', 'Card account creation requested');
    }
    /**
     * Marca o cartão como criado e salva o identificador gerado.
     */
    markCardCreated(cardId) {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.SUBMITTED], 'complete card creation');
        if (this.cardCreationStatus !== card_creation_status_enum_1.CardCreationStatus.REQUESTED) {
            throw new Error(`Proposal cannot complete card creation while card creation is ${this.cardCreationStatus}`);
        }
        this.status = proposal_status_enum_1.ProposalStatus.CARD_ACCOUNT_CREATED;
        this.cardCreationStatus = card_creation_status_enum_1.CardCreationStatus.CREATED;
        this.cardId = cardId;
        this.addAudit('card.created', `Card created with id ${cardId}`);
    }
    /**
     * Marca a criação do cartão como falha e registra o motivo.
     */
    markCardCreationFailed(reason) {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.SUBMITTED], 'fail card creation');
        if (this.cardCreationStatus !== card_creation_status_enum_1.CardCreationStatus.REQUESTED) {
            throw new Error(`Proposal cannot fail card creation while card creation is ${this.cardCreationStatus}`);
        }
        this.cardCreationStatus = card_creation_status_enum_1.CardCreationStatus.FAILED;
        this.rejectionReason = reason;
        this.addAudit('card.creation.failed', reason);
    }
    /**
     * Marca a proposta como totalmente concluída.
     */
    markCompleted() {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.CARD_ACCOUNT_CREATED], 'complete');
        this.status = proposal_status_enum_1.ProposalStatus.COMPLETED;
        this.addAudit('proposal.completed', 'Proposal completed');
    }
    /**
     * Marca a proposta como rejeitada com um motivo específico.
     */
    markRejected(reason) {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.RECEIVED, proposal_status_enum_1.ProposalStatus.OFFER_VALIDATED, proposal_status_enum_1.ProposalStatus.BENEFITS_VALIDATED], 'be rejected');
        this.status = proposal_status_enum_1.ProposalStatus.REJECTED;
        this.rejectionReason = reason;
        this.addAudit('proposal.rejected', reason);
    }
    /**
     * Atualiza o status de ativação de um benefício específico.
     */
    setBenefitActivationStatus(benefit, activationStatus) {
        this.benefitActivationStatus[benefit] = activationStatus;
        this.addAudit('benefit.activation.status', `${benefit} => ${activationStatus}`);
    }
    /**
     * Atualiza a lista de benefícios selecionados e registra a mudança na auditoria.
     */
    updateSelectedBenefits(benefits) {
        this.assertStatus([proposal_status_enum_1.ProposalStatus.OFFER_VALIDATED], 'update benefits');
        this.selectedBenefits = new benefit_selection_entity_1.BenefitSelection(benefits);
        this.addAudit('benefits.selection.updated', `Benefits updated to: ${benefits.join(', ')}`);
    }
}
exports.CreditCardProposal = CreditCardProposal;
