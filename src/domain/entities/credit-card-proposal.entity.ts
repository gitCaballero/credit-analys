import { BenefitActivationStatus } from '../enums/benefit-activation-status.enum';
import { CardCreationStatus } from '../enums/card-creation-status.enum';
import { OfferType } from '../enums/offer-type.enum';
import { ProposalStatus } from '../enums/proposal-status.enum';
import { BenefitType } from '../enums/benefit-type.enum';
import { AuditEntry } from './audit-entry.entity';
import { BenefitSelection } from './benefit-selection.entity';
import { CustomerProfile } from './customer-profile.entity';

/**
 * CreditCardProposal is the aggregate root for a credit card application.
 * It tracks offer selection, benefit selection, status, card creation, and audit history.
 */
export class CreditCardProposal {
  /** Selected benefit options for this proposal. */
  selectedBenefits: BenefitSelection;
  /** Activation status for each benefit type. */
  readonly benefitActivationStatus: Record<BenefitType, BenefitActivationStatus>;
  /** Audit trail for domain events affecting this proposal. */
  readonly auditEntries: AuditEntry[];

  constructor(
    /** Unique proposal identifier. */
    readonly proposalId: string,
    /** Customer financial and contact information. */
    readonly customerProfile: CustomerProfile,
    /** Offer type selected by the customer. */
    readonly offerType: OfferType,
    /** Initially selected benefits. */
    benefits: BenefitType[] = [],
  ) {
    this.selectedBenefits = new BenefitSelection(benefits);
    this.benefitActivationStatus = {} as Record<BenefitType, BenefitActivationStatus>;
    this.auditEntries = [];
    this.status = ProposalStatus.RECEIVED;
    this.cardCreationStatus = CardCreationStatus.NOT_CREATED;
  }

  /** Current lifecycle status of the proposal. */
  status: ProposalStatus;
  /** Current card account creation status. */
  cardCreationStatus: CardCreationStatus;
  /** Reason for rejection when the proposal or card creation fails. */
  rejectionReason?: string;
  /** Assigned card identifier when a card account is created. */
  cardId?: string;

  /**
   * Records a new audit entry for this proposal.
   */
  addAudit(event: string, detail: string, actor?: string): void {
    this.auditEntries.push(new AuditEntry(event, new Date(), detail, actor));
  }

  /**
   * Mark the proposal as having a validated offer.
   */
  markOfferValidated(): void {
    this.status = ProposalStatus.OFFER_VALIDATED;
    this.addAudit('offer.validated', `Offer ${this.offerType} validated`);
  }

  /**
   * Mark the proposal as having validated benefit selection.
   */
  markBenefitsValidated(): void {
    this.status = ProposalStatus.BENEFITS_VALIDATED;
    this.addAudit('benefits.validated', `Benefit selection validated: ${this.selectedBenefits.benefits.join(', ')}`);
  }

  /**
   * Mark the proposal as submitted for processing.
   */
  markSubmitted(): void {
    this.status = ProposalStatus.SUBMITTED;
    this.addAudit('proposal.submitted', 'Proposal submitted for processing');
  }

  /**
   * Mark the card creation request as sent.
   */
  markCardCreationRequested(): void {
    this.cardCreationStatus = CardCreationStatus.REQUESTED;
    this.addAudit('card.creation.requested', 'Card account creation requested');
  }

  /**
   * Mark the card as created and save the generated card identifier.
   */
  markCardCreated(cardId: string): void {
    this.cardCreationStatus = CardCreationStatus.CREATED;
    this.cardId = cardId;
    this.addAudit('card.created', `Card created with id ${cardId}`);
  }

  /**
   * Mark the card creation process as failed with a rejection reason.
   */
  markCardCreationFailed(reason: string): void {
    this.cardCreationStatus = CardCreationStatus.FAILED;
    this.rejectionReason = reason;
    this.addAudit('card.creation.failed', reason);
  }

  /**
   * Mark the proposal as fully completed.
   */
  markCompleted(): void {
    this.status = ProposalStatus.COMPLETED;
    this.addAudit('proposal.completed', 'Proposal completed');
  }

  /**
   * Mark the proposal as rejected with a specific reason.
   */
  markRejected(reason: string): void {
    this.status = ProposalStatus.REJECTED;
    this.rejectionReason = reason;
    this.addAudit('proposal.rejected', reason);
  }

  /**
   * Update the activation status for a single benefit.
   */
  setBenefitActivationStatus(benefit: BenefitType, activationStatus: BenefitActivationStatus): void {
    this.benefitActivationStatus[benefit] = activationStatus;
    this.addAudit('benefit.activation.status', `${benefit} => ${activationStatus}`);
  }

  /**
   * Update the selected benefit list and record the change in audit logs.
   */
  updateSelectedBenefits(benefits: BenefitType[]): void {
    this.selectedBenefits = new BenefitSelection(benefits);
    this.addAudit('benefits.selection.updated', `Benefits updated to: ${benefits.join(', ')}`);
  }
}
