import { AiAssistantAdapter, AiAssistantRequest, AiAssistantResponse } from '../ports/ai-assistant.adapter';
export declare class AiAssistantService {
    private readonly adapter;
    constructor(adapter: AiAssistantAdapter);
    explainProposal(request: AiAssistantRequest): Promise<AiAssistantResponse>;
}
