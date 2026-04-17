"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEntry = void 0;
/**
 * AuditEntry registra uma ação ou mudança de estado em uma proposta de cartão.
 * É usado para manter uma trilha imutável de eventos relevantes do domínio.
 */
class AuditEntry {
    constructor(
    /** Nome do evento de domínio, como proposal.created ou card.created. */
    event, 
    /** Momento exato em que o evento ocorreu. */
    timestamp, 
    /** Descrição legível ou detalhe adicional do evento. */
    detail, 
    /** Ator ou componente do sistema que causou o evento, quando disponível. */
    actor) {
        this.event = event;
        this.timestamp = timestamp;
        this.detail = detail;
        this.actor = actor;
    }
}
exports.AuditEntry = AuditEntry;
