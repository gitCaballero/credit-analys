import { Inject, Injectable } from '@nestjs/common';
import {
  AiAssistantPort,
  AiAssistantRequest,
  AiAssistantResponse,
} from '../ports/outbound/ai-assistant.port';

@Injectable()
export class AiAssistantService {
  constructor(
    @Inject('AiAssistantPort')
    private readonly aiAssistantPort: AiAssistantPort,
  ) {}

  async explainProposal(request: AiAssistantRequest): Promise<AiAssistantResponse> {
    return this.aiAssistantPort.generateProposalExplanation(request);
  }
}
