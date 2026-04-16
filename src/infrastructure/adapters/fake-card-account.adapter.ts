import { Injectable } from '@nestjs/common';
import { CardAccountAdapter, CardAccountResponse, CreateCardAccountPayload } from '../../application/ports/card-account.adapter';

@Injectable()
export class FakeCardAccountAdapter implements CardAccountAdapter {
  async createCardAccount(payload: CreateCardAccountPayload): Promise<CardAccountResponse> {
    return {
      success: true,
      cardId: `CARD-${payload.proposalId}`,
    };
  }
}
