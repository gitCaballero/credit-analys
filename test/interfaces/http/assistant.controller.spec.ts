import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AssistantController } from '../../../src/adapters/inbound/http/controllers/assistant.controller';

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
          provide: 'AssistantWorkflowPort',
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

  it('POST /assistant/customer/message forces customer audience', async () => {
    chatAssistantUseCaseMock.execute.mockResolvedValue({
      message: 'Estado listo',
      source: 'chat-model',
    });

    await request(app.getHttpServer())
      .post('/assistant/customer/message')
      .send({ userMessage: 'Consultar propuesta' })
      .expect(201);

    expect(chatAssistantUseCaseMock.execute).toHaveBeenLastCalledWith({
      userMessage: 'Consultar propuesta',
      audience: 'customer',
    });
  });

  it('POST /assistant/specialist/message forces credit specialist audience', async () => {
    chatAssistantUseCaseMock.execute.mockResolvedValue({
      message: 'Validacion realizada',
      source: 'chat-model',
    });

    await request(app.getHttpServer())
      .post('/assistant/specialist/message')
      .send({ userMessage: 'Validar oferta proposal-1' })
      .expect(201);

    expect(chatAssistantUseCaseMock.execute).toHaveBeenLastCalledWith({
      userMessage: 'Validar oferta proposal-1',
      audience: 'credit_specialist',
    });
  });
});
