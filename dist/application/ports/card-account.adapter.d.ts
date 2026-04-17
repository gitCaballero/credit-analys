export interface CreateCardAccountPayload {
    proposalId: string;
    fullName: string;
    nationalId: string;
    email: string;
    offerType: string;
}
export interface CardAccountResponse {
    success: boolean;
    cardId?: string;
    reason?: string;
}
export interface CardAccountAdapter {
    createCardAccount(payload: CreateCardAccountPayload): Promise<CardAccountResponse>;
}
