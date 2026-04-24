import { AssistantAudience, ChatAssistantRequest, ChatAssistantResponse } from '../outbound/chat-assistant-model.port';
export interface AssistantWorkflowPort {
    execute(request: ChatAssistantRequest): Promise<ChatAssistantResponse>;
    executeTool(toolName: string, parameters: Record<string, unknown>, audience?: AssistantAudience): Promise<ChatAssistantResponse>;
}
