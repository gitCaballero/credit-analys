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
export declare class CreditCardProposal {
    /** Identificador único da proposta. */
    readonly proposalId: string;
    /** Informações financeiras e de contato do cliente. */
    readonly customerProfile: CustomerProfile;
    /** Tipo de oferta selecionado pelo cliente. */
    readonly offerType: OfferType;
    /** Benefícios selecionados para esta proposta. */
    selectedBenefits: BenefitSelection;
    /** Status de ativação para cada tipo de benefício. */
    readonly benefitActivationStatus: Record<BenefitType, BenefitActivationStatus>;
    /** Trilha de auditoria dos eventos de domínio que afetam esta proposta. */
    readonly auditEntries: AuditEntry[];
    constructor(
    /** Identificador único da proposta. */
    proposalId: string, 
    /** Informações financeiras e de contato do cliente. */
    customerProfile: CustomerProfile, 
    /** Tipo de oferta selecionado pelo cliente. */
    offerType: OfferType, 
    /** Benefícios selecionados inicialmente. */
    benefits?: BenefitType[]);
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
    addAudit(event: string, detail: string, actor?: string): void;
    /**
     * Marca a proposta como tendo a oferta validada.
     */
    markOfferValidated(): void;
    /**
     * Marca a proposta como tendo a seleção de benefícios validada.
     */
    markBenefitsValidated(): void;
    /**
     * Marca a proposta como enviada para processamento.
     */
    markSubmitted(): void;
    /**
     * Marca a solicitação de criação do cartão como enviada.
     */
    markCardCreationRequested(): void;
    /**
     * Marca o cartão como criado e salva o identificador gerado.
     */
    markCardCreated(cardId: string): void;
    /**
     * Marca a criação do cartão como falha e registra o motivo.
     */
    markCardCreationFailed(reason: string): void;
    /**
     * Marca a proposta como totalmente concluída.
     */
    markCompleted(): void;
    /**
     * Marca a proposta como rejeitada com um motivo específico.
     */
    markRejected(reason: string): void;
    /**
     * Atualiza o status de ativação de um benefício específico.
     */
    setBenefitActivationStatus(benefit: BenefitType, activationStatus: BenefitActivationStatus): void;
    /**
     * Atualiza a lista de benefícios selecionados e registra a mudança na auditoria.
     */
    updateSelectedBenefits(benefits: BenefitType[]): void;
}
