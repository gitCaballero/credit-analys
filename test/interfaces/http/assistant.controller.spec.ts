import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AssistantController } from '../../../src/interfaces/http/assistant.controller';
import { ChatAssistantUseCase } from '../../../src/application/use-cases/chat-assistant.use-case';

describe('AssistantController', () => {
  let app: INestApplication;
  const chatAssistantUseCaseMock = {
    execute: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssistantController],
      providers: [
        {
          provide: ChatAssistantUseCase,
          useValue: chatAssistantUseCaseMock,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /assistant/message returns assistant response', async () => {
    chatAssistantUseCaseMock.execute.mockResolvedValue({
      message: 'Hola, ¿en qué puedo ayudarte?',
      source: 'chat-model',
    });

    await request(app.getHttpServer())
      .post('/assistant/message')
      .send({ userMessage: 'Quiero consultar mi propuesta' })
      .expect(201)
      .expect({
        message: 'Hola, ¿en qué puedo ayudarte?',
        source: 'chat-model',
      });
  });
});
