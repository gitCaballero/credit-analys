import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as readline from 'readline';
import { AppModule } from '../../../app.module';
import {
  AssistantAudience,
  ChatAssistantRequest,
} from '../../../application/ports/outbound/chat-assistant-model.port';
import { AssistantWorkflowPort } from '../../../application/ports/inbound/assistant-workflow.port';

const TOOL_OPTIONS = [
  {
    id: 1,
    toolName: 'create_proposal',
    description: 'Solicitar um novo crédito com perfil, oferta e benefícios.',
    triggerText: 'Solicitar um novo crédito com perfil, oferta e benefícios.',
    audiences: ['customer'] as AssistantAudience[],
    fields: [
      { key: 'fullName', prompt: 'Por favor, informe o nome completo do cliente.' },
      { key: 'nationalId', prompt: 'Informe o documento de identidade do cliente.' },
      { key: 'income', prompt: 'Informe a renda do cliente em números.' },
      { key: 'investments', prompt: 'Informe o valor de investimentos do cliente em números.' },
      { key: 'currentAccountYears', prompt: 'Informe os anos de conta corrente.' },
      { key: 'email', prompt: 'Informe o email do cliente.' },
      { key: 'offerType', prompt: 'Informe o tipo de oferta: A, B ou C.' },
      { key: 'selectedBenefits', prompt: 'Informe os benefícios separados por vírgula: cashback, points, travel, vip.' },
    ],
  },
  {
    id: 2,
    toolName: 'check_status',
    description: 'Consultar o status de uma proposta.',
    triggerText: 'Consultar o status de uma proposta.',
    audiences: ['customer', 'credit_specialist'] as AssistantAudience[],
    fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
  },
  {
    id: 3,
    toolName: 'validate_offer',
    description: 'Validar a elegibilidade de uma oferta.',
    triggerText: 'Validar a elegibilidade de uma oferta.',
    audiences: ['credit_specialist'] as AssistantAudience[],
    fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
  },
  {
    id: 4,
    toolName: 'validate_benefits',
    description: 'Validar os benefícios selecionados.',
    triggerText: 'Validar os benefícios selecionados.',
    audiences: ['credit_specialist'] as AssistantAudience[],
    fields: [
      { key: 'proposalId', prompt: 'Informe o ID da proposta.' },
      { key: 'selectedBenefits', prompt: 'Informe os benefícios separados por vírgula: cashback, points, travel, viagem, vip, lounge.' },
    ],
  },
  {
    id: 5,
    toolName: 'submit_proposal',
    description: 'Enviar a proposta para continuar o processo.',
    triggerText: 'Enviar a proposta para continuar o processo.',
    audiences: ['credit_specialist'] as AssistantAudience[],
    fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
  },
  {
    id: 6,
    toolName: 'create_card_account',
    description: 'Criar o cartão associado à proposta.',
    triggerText: 'Criar o cartão associado à proposta.',
    audiences: ['credit_specialist'] as AssistantAudience[],
    fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
  },
  {
    id: 7,
    toolName: 'activate_benefits',
    description: 'Ativar benefícios no cartão.',
    triggerText: 'Ativar benefícios no cartão.',
    audiences: ['credit_specialist'] as AssistantAudience[],
    fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
  },
  {
    id: 8,
    toolName: 'explain_proposal',
    description: 'Explicar o status e decisões da proposta.',
    triggerText: 'Explicar o status e decisões da proposta.',
    audiences: ['customer', 'credit_specialist'] as AssistantAudience[],
    fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
  },
  {
    id: 9,
    toolName: 'list_proposals',
    description: 'Listar todas as propostas para acompanhamento operacional.',
    triggerText: 'Listar todas as propostas para acompanhamento operacional.',
    audiences: ['credit_specialist'] as AssistantAudience[],
    fields: [],
  },
];

function printOptions(audience: AssistantAudience) {
  console.log(`\nPerfil ativo: ${audience === 'customer' ? 'cliente' : 'especialista'}`);
  console.log('Opções disponíveis:');
  TOOL_OPTIONS.filter((option) => option.audiences.includes(audience)).forEach((option) =>
    console.log(` ${option.id} - ${option.description}`),
  );
  console.log('');
}

function getSelectedOption(selection: string, audience: AssistantAudience) {
  return TOOL_OPTIONS.find((option) => option.id === Number(selection) && option.audiences.includes(audience));
}

const RESERVED_COMMAND_WORDS = new Set([
  'solicitar',
  'crear',
  'mostrar',
  'menu',
  'opciones',
  'help',
  'ayuda',
  'validar',
  'status',
  'estado',
  'enviar',
  'submit',
  'activar',
  'explicar',
]);

function isCommandLikeInput(value: string) {
  const normalized = value.trim().toLowerCase();
  return RESERVED_COMMAND_WORDS.has(normalized);
}

function parseOfferType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'a') return 'A';
  if (normalized === 'b') return 'B';
  if (normalized === 'c') return 'C';
  return undefined;
}

function parseSelectedBenefits(value: string) {
  return value
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .map((item) => {
      if (item === 'TRAVEL' || item === 'VIAGEM' || item === 'VIAJE') return 'TRAVEL_INSURANCE';
      if (item === 'VIP') return 'VIP_LOUNGE';
      if (item === 'LOUNGE') return 'VIP_LOUNGE';
      if (item === 'POINTS' || item === 'PONTOS') return 'POINTS';
      if (item === 'CASHBACK') return 'CASHBACK';
      return item;
    })
    .filter((item) => ['CASHBACK', 'POINTS', 'TRAVEL_INSURANCE', 'VIP_LOUNGE'].includes(item));
}

function setFieldValue(parameters: Record<string, unknown>, key: string, value: string) {
  switch (key) {
    case 'fullName':
    case 'nationalId':
    case 'email':
      parameters.customerProfile = {
        ...(parameters.customerProfile as Record<string, unknown>),
        [key]: value.trim(),
      };
      break;
    case 'income':
    case 'investments':
    case 'currentAccountYears':
      parameters.customerProfile = {
        ...(parameters.customerProfile as Record<string, unknown>),
        [key]: Number(value.replace(/[^0-9\.]/g, '')) || undefined,
      };
      break;
    case 'offerType':
      parameters.offerType = parseOfferType(value);
      break;
    case 'selectedBenefits':
      parameters.selectedBenefits = parseSelectedBenefits(value);
      break;
    case 'proposalId':
      parameters.proposalId = value.trim();
      break;
    default:
      parameters[key] = value.trim();
  }
}

const sessionState: {
  pendingOptionId?: number;
  currentFieldIndex: number;
  parameters: Record<string, unknown>;
  lastProposalId?: string;
  audience: AssistantAudience;
} = {
  currentFieldIndex: 0,
  parameters: {},
  audience: 'customer',
};

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const assistant = appContext.get<AssistantWorkflowPort>('AssistantWorkflowPort');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  console.log('Assistente de crédito no terminal. Digite "sair" para encerrar.');
  console.log('Use "perfil cliente" ou "perfil especialista" para trocar o modo de atendimento.');
  console.log('Selecione uma opção digitando seu número ou digite sua mensagem diretamente.');
  printOptions(sessionState.audience);
  rl.prompt();

  rl.on('line', async (line) => {
    const message = line.trim();
    if (!message) {
      rl.prompt();
      return;
    }

    const normalized = message.toLowerCase();
    if (['sair', 'salir', 'exit', 'quit'].includes(normalized)) {
      rl.close();
      return;
    }

    if (['opcoes', 'opciones', 'options', 'menu', 'help', 'ajuda'].includes(normalized)) {
      printOptions(sessionState.audience);
      rl.prompt();
      return;
    }

    if (normalized === 'perfil cliente') {
      sessionState.audience = 'customer';
      console.log('\nPerfil alterado para cliente.');
      printOptions(sessionState.audience);
      rl.prompt();
      return;
    }

    if (normalized === 'perfil especialista') {
      sessionState.audience = 'credit_specialist';
      console.log('\nPerfil alterado para especialista.');
      printOptions(sessionState.audience);
      rl.prompt();
      return;
    }

    const selectedOption = getSelectedOption(message, sessionState.audience);

    if (sessionState.pendingOptionId) {
      const pendingOption = getSelectedOption(String(sessionState.pendingOptionId), sessionState.audience);
      if (!pendingOption) {
        sessionState.pendingOptionId = undefined;
        sessionState.currentFieldIndex = 0;
        sessionState.parameters = {};
        rl.prompt();
        return;
      }

      const currentField = pendingOption.fields[sessionState.currentFieldIndex];
      const value = message.trim();

      if (currentField.key === 'proposalId' && isCommandLikeInput(value)) {
        console.log(`\nNão é um ID de proposta válido. ${currentField.prompt}`);
        if (sessionState.lastProposalId) {
          console.log(`ID da última proposta criada: ${sessionState.lastProposalId}`);
        }
        rl.prompt();
        return;
      }

      if (currentField.key === 'offerType' && !parseOfferType(value)) {
        console.log(`\nTipo de oferta inválido. ${currentField.prompt}`);
        rl.prompt();
        return;
      }

      if (currentField.key === 'selectedBenefits' && parseSelectedBenefits(value).length === 0) {
        console.log(`\nNão reconheci benefícios válidos. ${currentField.prompt}`);
        rl.prompt();
        return;
      }

      setFieldValue(sessionState.parameters, currentField.key, message);
      sessionState.currentFieldIndex += 1;

      if (sessionState.currentFieldIndex < pendingOption.fields.length) {
        console.log(`\n${pendingOption.fields[sessionState.currentFieldIndex].prompt}`);
        if (pendingOption.fields[sessionState.currentFieldIndex].key === 'proposalId' && sessionState.lastProposalId) {
          console.log(`ID da última proposta criada: ${sessionState.lastProposalId}`);
        }
        rl.prompt();
        return;
      }

      const requestParameters = sessionState.parameters;

      sessionState.pendingOptionId = undefined;
      sessionState.currentFieldIndex = 0;
      sessionState.parameters = {};

      try {
        const response = await assistant.executeTool(pendingOption.toolName, requestParameters, sessionState.audience);
        console.log(`\n[Assistente] ${response.message}`);
        if (response.toolName) {
          console.log(`[Ferramenta] ${response.toolName}`);
        }
        if (response.toolResult !== undefined && response.toolResult !== null) {
          console.log(`[Resultado] ${JSON.stringify(response.toolResult, null, 2)}`);
          if (pendingOption.toolName === 'create_proposal' && typeof response.toolResult === 'object' && response.toolResult !== null) {
            const createdProposalId = (response.toolResult as Record<string, unknown>).proposalId;
            if (typeof createdProposalId === 'string') {
              sessionState.lastProposalId = createdProposalId;
              console.log(`[ID da proposta] ${createdProposalId}`);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao executar o assistente:', error);
      }

      printOptions(sessionState.audience);
      rl.prompt();
      return;
    }

    if (selectedOption) {
      sessionState.pendingOptionId = selectedOption.id;
      sessionState.currentFieldIndex = 0;
      sessionState.parameters = {};
      if (selectedOption.fields.length === 0) {
        try {
          const response = await assistant.executeTool(selectedOption.toolName, {}, sessionState.audience);
          console.log(`\n[Assistente] ${response.message}`);
          if (response.toolName) {
            console.log(`[Ferramenta] ${response.toolName}`);
          }
          if (response.toolResult !== undefined && response.toolResult !== null) {
            console.log(`[Resultado] ${JSON.stringify(response.toolResult, null, 2)}`);
          }
        } catch (error) {
          console.error('Erro ao executar o assistente:', error);
        }
        printOptions(sessionState.audience);
        rl.prompt();
        return;
      }

      console.log(`\n${selectedOption.fields[0].prompt}`);
      rl.prompt();
      return;
    }

    if (/^\d+$/.test(message)) {
      console.log(`Opção inválida: ${message}. Por favor selecione um número válido.`);
      printOptions(sessionState.audience);
      rl.prompt();
      return;
    }

    const request: ChatAssistantRequest = { userMessage: message, audience: sessionState.audience };

    try {
      const response = await assistant.execute(request);
      console.log(`\n[Assistente] ${response.message}`);
      if (response.toolName) {
        console.log(`[Ferramenta] ${response.toolName}`);
      }
      if (response.toolResult !== undefined && response.toolResult !== null) {
        console.log(`[Resultado] ${JSON.stringify(response.toolResult, null, 2)}`);
      }
    } catch (error) {
      console.error('Erro ao executar o assistente:', error);
    }

    rl.prompt();
  });

  rl.on('close', async () => {
    await appContext.close();
    console.log('Encerrando o assistente. Até logo.');
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('Falha ao iniciar o assistente CLI:', err);
  process.exit(1);
});
