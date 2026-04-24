import { Injectable } from '@nestjs/common';
import {
  CardAccountPort,
  CardAccountResponse,
  CreateCardAccountPayload,
} from '../../application/ports/outbound/card-account.port';

@Injectable()
export class FakeCardAccountAdapter implements CardAccountPort {
  async createCardAccount(payload: CreateCardAccountPayload): Promise<CardAccountResponse> {
    return {
      success: true,
      cardId: `CARD-${payload.proposalId}`,
    };
  }
}
