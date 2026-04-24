import { AssistantMessageDto } from '../dto/assistant.dto';
import { AssistantWorkflowPort } from '../../../../application/ports/inbound/assistant-workflow.port';
export declare class AssistantController {
    private readonly assistantWorkflow;
    constructor(assistantWorkflow: AssistantWorkflowPort);
    handleMessage(payload: AssistantMessageDto): Promise<import("../../../../application/ports/outbound/chat-assistant-model.port").ChatAssistantResponse>;
    handleCustomerMessage(payload: AssistantMessageDto): Promise<import("../../../../application/ports/outbound/chat-assistant-model.port").ChatAssistantResponse>;
    handleSpecialistMessage(payload: AssistantMessageDto): Promise<import("../../../../application/ports/outbound/chat-assistant-model.port").ChatAssistantResponse>;
}
