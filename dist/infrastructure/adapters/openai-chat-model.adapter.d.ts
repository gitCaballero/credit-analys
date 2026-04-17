import { ChatAssistantModelAdapter, ChatAssistantModelRequest, ChatAssistantModelResponse } from '../../application/ports/chat-assistant.adapter';
export declare class OpenAiChatModelAdapter implements ChatAssistantModelAdapter {
    private readonly client;
    constructor();
    interpretIntent(request: ChatAssistantModelRequest): Promise<ChatAssistantModelResponse>;
}
