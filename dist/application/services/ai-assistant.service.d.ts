import { AiAssistantPort, AiAssistantRequest, AiAssistantResponse } from '../ports/outbound/ai-assistant.port';
export declare class AiAssistantService {
    private readonly aiAssistantPort;
    constructor(aiAssistantPort: AiAssistantPort);
    explainProposal(request: AiAssistantRequest): Promise<AiAssistantResponse>;
}
