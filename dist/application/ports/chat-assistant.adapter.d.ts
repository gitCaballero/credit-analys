export interface ChatAssistantRequest {
    userMessage: string;
    proposalId?: string;
    parameters?: Record<string, unknown>;
}
export interface ChatAssistantResponse {
    message: string;
    source: string;
    toolName?: string;
    toolResult?: unknown;
    metadata?: Record<string, unknown>;
}
export interface ChatToolDescriptor {
    name: string;
    description: string;
    requiredParameters: string[];
}
export interface ChatAssistantModelRequest {
    userMessage: string;
    proposalId?: string;
    availableTools: ChatToolDescriptor[];
    parameters?: Record<string, unknown>;
}
export interface ChatAssistantModelResponse {
    toolName: string;
    toolInput: Record<string, unknown>;
    assistantMessage: string;
}
export interface ChatAssistantModelAdapter {
    interpretIntent(request: ChatAssistantModelRequest): Promise<ChatAssistantModelResponse>;
}
