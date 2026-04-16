import { Injectable } from '@nestjs/common';
import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { BenefitsAdapter, BenefitActivationResponse, ActivateBenefitPayload } from '../../application/ports/benefits.adapter';

@Injectable()
export class FakeBenefitsAdapter implements BenefitsAdapter {
  async activateBenefit(payload: ActivateBenefitPayload): Promise<BenefitActivationResponse> {
    return {
      success: true,
      benefit: payload.benefit,
    };
  }
}
