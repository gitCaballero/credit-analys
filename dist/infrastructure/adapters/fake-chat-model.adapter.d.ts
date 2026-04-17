import { ChatAssistantModelAdapter, ChatAssistantModelRequest, ChatAssistantModelResponse } from '../../application/ports/chat-assistant.adapter';
export declare class FakeChatModelAdapter implements ChatAssistantModelAdapter {
    interpretIntent(request: ChatAssistantModelRequest): Promise<ChatAssistantModelResponse>;
}
