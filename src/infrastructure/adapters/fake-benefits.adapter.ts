import { Injectable } from '@nestjs/common';
import { BenefitType } from '../../domain/enums/benefit-type.enum';
import {
  ActivateBenefitPayload,
  BenefitActivationResponse,
  BenefitsPort,
} from '../../application/ports/outbound/benefits.port';

@Injectable()
export class FakeBenefitsAdapter implements BenefitsPort {
  async activateBenefit(payload: ActivateBenefitPayload): Promise<BenefitActivationResponse> {
    return {
      success: true,
      benefit: payload.benefit,
    };
  }
}
