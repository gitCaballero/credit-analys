import { ChatAssistantModelPort, ChatAssistantModelRequest, ChatAssistantModelResponse } from '../../application/ports/outbound/chat-assistant-model.port';
export declare class OpenAiChatModelAdapter implements ChatAssistantModelPort {
    private readonly client;
    constructor();
    interpretIntent(request: ChatAssistantModelRequest): Promise<ChatAssistantModelResponse>;
}
