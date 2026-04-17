import { CardAccountAdapter, CardAccountResponse, CreateCardAccountPayload } from '../../application/ports/card-account.adapter';
export declare class FakeCardAccountAdapter implements CardAccountAdapter {
    createCardAccount(payload: CreateCardAccountPayload): Promise<CardAccountResponse>;
}
