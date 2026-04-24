import { CardAccountPort, CardAccountResponse, CreateCardAccountPayload } from '../../application/ports/outbound/card-account.port';
export declare class FakeCardAccountAdapter implements CardAccountPort {
    createCardAccount(payload: CreateCardAccountPayload): Promise<CardAccountResponse>;
}
