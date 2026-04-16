/**
 * AuditEntry records an action or state change in a credit card proposal.
 * It is used to keep an immutable trail of significant domain events.
 */
export class AuditEntry {
  constructor(
    /** The domain event name, such as proposal.created or card.created. */
    readonly event: string,
    /** The exact timestamp when the event occurred. */
    readonly timestamp: Date,
    /** A human-readable description or details of the event. */
    readonly detail: string,
    /** Optional actor or system component that caused the event. */
    readonly actor?: string,
  ) {}
}
