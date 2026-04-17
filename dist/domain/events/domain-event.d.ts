export interface DomainEvent {
    readonly eventType: string;
    readonly aggregateId: string;
    readonly payload: Record<string, unknown>;
    readonly occurredAt: string;
}
