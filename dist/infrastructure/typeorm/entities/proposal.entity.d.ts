export declare class ProposalEntity {
    id: string;
    proposalId: string;
    fullName: string;
    nationalId: string;
    income: number;
    investments: number;
    currentAccountYears: number;
    email: string;
    offerType: string;
    selectedBenefits: string[];
    benefitActivationStatus: Record<string, string>;
    status: string;
    cardCreationStatus: string;
    rejectionReason?: string;
    cardId?: string;
    auditEntries: Array<{
        event: string;
        timestamp: string;
        detail: string;
        actor?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
