import { AssistantMessageDto } from './assistant.dto';
import { ChatAssistantUseCase } from '../../application/use-cases/chat-assistant.use-case';
export declare class AssistantController {
    private readonly chatAssistantUseCase;
    constructor(chatAssistantUseCase: ChatAssistantUseCase);
    handleMessage(payload: AssistantMessageDto): Promise<import("../../application/ports/chat-assistant.adapter").ChatAssistantResponse>;
}
