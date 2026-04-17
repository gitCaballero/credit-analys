import { BenefitActivationStatus } from '../enums/benefit-activation-status.enum';
import { CardCreationStatus } from '../enums/card-creation-status.enum';
import { OfferType } from '../enums/offer-type.enum';
import { ProposalStatus } from '../enums/proposal-status.enum';
import { BenefitType } from '../enums/benefit-type.enum';
import { AuditEntry } from './audit-entry.entity';
import { BenefitSelection } from './benefit-selection.entity';
import { CustomerProfile } from './customer-profile.entity';

/**
 * CreditCardProposal é a raiz de agregado de uma proposta de cartão de crédito.
 * Ela controla a oferta escolhida, os benefícios selecionados, o status, a criação do cartão e o histórico de auditoria.
 */
export class CreditCardProposal {
  /** Benefícios selecionados para esta proposta. */
  selectedBenefits: BenefitSelection;
  /** Status de ativação para cada tipo de benefício. */
  readonly benefitActivationStatus: Record<BenefitType, BenefitActivationStatus>;
  /** Trilha de auditoria dos eventos de domínio que afetam esta proposta. */
  readonly auditEntries: AuditEntry[];

  constructor(
    /** Identificador único da proposta. */
    readonly proposalId: string,
    /** Informações financeiras e de contato do cliente. */
    readonly customerProfile: CustomerProfile,
    /** Tipo de oferta selecionado pelo cliente. */
    readonly offerType: OfferType,
    /** Benefícios selecionados inicialmente. */
    benefits: BenefitType[] = [],
  ) {
    this.selectedBenefits = new BenefitSelection(benefits);
    this.benefitActivationStatus = {} as Record<BenefitType, BenefitActivationStatus>;
    this.auditEntries = [];
    this.status = ProposalStatus.RECEIVED;
    this.cardCreationStatus = CardCreationStatus.NOT_CREATED;
  }

  /** Status atual do ciclo de vida da proposta. */
  status: ProposalStatus;
  /** Status atual da criação da conta do cartão. */
  cardCreationStatus: CardCreationStatus;
  /** Motivo da rejeição quando a proposta ou a criação do cartão falha. */
  rejectionReason?: string;
  /** Identificador do cartão atribuído quando a conta é criada. */
  cardId?: string;

  /**
   * Registra uma nova entrada de auditoria para esta proposta.
   */
  addAudit(event: string, detail: string, actor?: string): void {
    this.auditEntries.push(new AuditEntry(event, new Date(), detail, actor));
  }

  /**
   * Marca a proposta como tendo a oferta validada.
   */
  markOfferValidated(): void {
    this.status = ProposalStatus.OFFER_VALIDATED;
    this.addAudit('offer.validated', `Offer ${this.offerType} validated`);
  }

  /**
   * Marca a proposta como tendo a seleção de benefícios validada.
   */
  markBenefitsValidated(): void {
    this.status = ProposalStatus.BENEFITS_VALIDATED;
    this.addAudit('benefits.validated', `Benefit selection validated: ${this.selectedBenefits.benefits.join(', ')}`);
  }

  /**
   * Marca a proposta como enviada para processamento.
   */
  markSubmitted(): void {
    this.status = ProposalStatus.SUBMITTED;
    this.addAudit('proposal.submitted', 'Proposal submitted for processing');
  }

  /**
   * Marca a solicitação de criação do cartão como enviada.
   */
  markCardCreationRequested(): void {
    this.cardCreationStatus = CardCreationStatus.REQUESTED;
    this.addAudit('card.creation.requested', 'Card account creation requested');
  }

  /**
   * Marca o cartão como criado e salva o identificador gerado.
   */
  markCardCreated(cardId: string): void {
    this.status = ProposalStatus.CARD_ACCOUNT_CREATED;
    this.cardCreationStatus = CardCreationStatus.CREATED;
    this.cardId = cardId;
    this.addAudit('card.created', `Card created with id ${cardId}`);
  }

  /**
   * Marca a criação do cartão como falha e registra o motivo.
   */
  markCardCreationFailed(reason: string): void {
    this.cardCreationStatus = CardCreationStatus.FAILED;
    this.rejectionReason = reason;
    this.addAudit('card.creation.failed', reason);
  }

  /**
   * Marca a proposta como totalmente concluída.
   */
  markCompleted(): void {
    this.status = ProposalStatus.COMPLETED;
    this.addAudit('proposal.completed', 'Proposal completed');
  }

  /**
   * Marca a proposta como rejeitada com um motivo específico.
   */
  markRejected(reason: string): void {
    this.status = ProposalStatus.REJECTED;
    this.rejectionReason = reason;
    this.addAudit('proposal.rejected', reason);
  }

  /**
   * Atualiza o status de ativação de um benefício específico.
   */
  setBenefitActivationStatus(benefit: BenefitType, activationStatus: BenefitActivationStatus): void {
    this.benefitActivationStatus[benefit] = activationStatus;
    this.addAudit('benefit.activation.status', `${benefit} => ${activationStatus}`);
  }

  /**
   * Atualiza a lista de benefícios selecionados e registra a mudança na auditoria.
   */
  updateSelectedBenefits(benefits: BenefitType[]): void {
    this.selectedBenefits = new BenefitSelection(benefits);
    this.addAudit('benefits.selection.updated', `Benefits updated to: ${benefits.join(', ')}`);
  }
}
