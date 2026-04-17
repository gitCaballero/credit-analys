export declare class OutboxEventEntity {
    id: string;
    eventType: string;
    payload: Record<string, unknown>;
    aggregateId: string;
    status: string;
    createdAt: Date;
    processedAt?: Date;
}
