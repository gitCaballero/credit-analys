import { Body, Controller, Post } from '@nestjs/common';
import { AssistantMessageDto } from '../dto/assistant.dto';
import { ChatAssistantUseCase } from '../../../application/use-cases/chat-assistant.use-case';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly chatAssistantUseCase: ChatAssistantUseCase) {}

  @Post('message')
  async handleMessage(@Body() payload: AssistantMessageDto) {
    return this.chatAssistantUseCase.execute(payload);
  }
}
