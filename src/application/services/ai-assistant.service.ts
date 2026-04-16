import { Inject, Injectable } from '@nestjs/common';
import {
  AiAssistantAdapter,
  AiAssistantRequest,
  AiAssistantResponse,
} from '../ports/ai-assistant.adapter';

@Injectable()
export class AiAssistantService {
  constructor(
    @Inject('AiAssistantAdapter')
    private readonly adapter: AiAssistantAdapter,
  ) {}

  async explainProposal(request: AiAssistantRequest): Promise<AiAssistantResponse> {
    return this.adapter.generateProposalExplanation(request);
  }
}
