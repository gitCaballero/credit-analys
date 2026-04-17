import { AiAssistantAdapter, AiAssistantRequest, AiAssistantResponse } from '../../application/ports/ai-assistant.adapter';
export declare class FakeAiAssistantAdapter implements AiAssistantAdapter {
    generateProposalExplanation(request: AiAssistantRequest): Promise<AiAssistantResponse>;
}
