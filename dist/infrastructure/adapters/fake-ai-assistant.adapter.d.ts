import { AiAssistantPort, AiAssistantRequest, AiAssistantResponse } from '../../application/ports/outbound/ai-assistant.port';
export declare class FakeAiAssistantAdapter implements AiAssistantPort {
    generateProposalExplanation(request: AiAssistantRequest): Promise<AiAssistantResponse>;
}
