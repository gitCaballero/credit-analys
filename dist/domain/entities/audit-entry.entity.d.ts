/**
 * AuditEntry registra uma ação ou mudança de estado em uma proposta de cartão.
 * É usado para manter uma trilha imutável de eventos relevantes do domínio.
 */
export declare class AuditEntry {
    /** Nome do evento de domínio, como proposal.created ou card.created. */
    readonly event: string;
    /** Momento exato em que o evento ocorreu. */
    readonly timestamp: Date;
    /** Descrição legível ou detalhe adicional do evento. */
    readonly detail: string;
    /** Ator ou componente do sistema que causou o evento, quando disponível. */
    readonly actor?: string | undefined;
    constructor(
    /** Nome do evento de domínio, como proposal.created ou card.created. */
    event: string, 
    /** Momento exato em que o evento ocorreu. */
    timestamp: Date, 
    /** Descrição legível ou detalhe adicional do evento. */
    detail: string, 
    /** Ator ou componente do sistema que causou o evento, quando disponível. */
    actor?: string | undefined);
}
