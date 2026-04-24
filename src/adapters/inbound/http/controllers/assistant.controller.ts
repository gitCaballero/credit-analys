import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AssistantMessageDto } from '../dto/assistant.dto';
import { AssistantWorkflowPort } from '../../../../application/ports/inbound/assistant-workflow.port';

@Controller('assistant')
export class AssistantController {
  constructor(
    @Inject('AssistantWorkflowPort')
    private readonly assistantWorkflow: AssistantWorkflowPort,
  ) {}

  @Post('message')
  async handleMessage(@Body() payload: AssistantMessageDto) {
    return this.assistantWorkflow.execute(payload);
  }

  @Post('customer/message')
  async handleCustomerMessage(@Body() payload: AssistantMessageDto) {
    return this.assistantWorkflow.execute({
      ...payload,
      audience: 'customer',
    });
  }

  @Post('specialist/message')
  async handleSpecialistMessage(@Body() payload: AssistantMessageDto) {
    return this.assistantWorkflow.execute({
      ...payload,
      audience: 'credit_specialist',
    });
  }
}
