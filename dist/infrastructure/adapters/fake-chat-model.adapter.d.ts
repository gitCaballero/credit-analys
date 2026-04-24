import { ChatAssistantModelPort, ChatAssistantModelRequest, ChatAssistantModelResponse } from '../../application/ports/outbound/chat-assistant-model.port';
export declare class FakeChatModelAdapter implements ChatAssistantModelPort {
    interpretIntent(request: ChatAssistantModelRequest): Promise<ChatAssistantModelResponse>;
}
