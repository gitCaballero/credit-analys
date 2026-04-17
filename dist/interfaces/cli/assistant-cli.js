"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const readline = __importStar(require("readline"));
const app_module_1 = require("../../app.module");
const chat_assistant_use_case_1 = require("../../application/use-cases/chat-assistant.use-case");
const TOOL_OPTIONS = [
    {
        id: 1,
        toolName: 'create_proposal',
        description: 'Solicitar um novo crédito com perfil, oferta e benefícios.',
        triggerText: 'Solicitar um novo crédito com perfil, oferta e benefícios.',
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
        fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
    },
    {
        id: 3,
        toolName: 'validate_offer',
        description: 'Validar a elegibilidade de uma oferta.',
        triggerText: 'Validar a elegibilidade de uma oferta.',
        fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
    },
    {
        id: 4,
        toolName: 'validate_benefits',
        description: 'Validar os benefícios selecionados.',
        triggerText: 'Validar os benefícios selecionados.',
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
        fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
    },
    {
        id: 6,
        toolName: 'create_card_account',
        description: 'Criar o cartão associado à proposta.',
        triggerText: 'Criar o cartão associado à proposta.',
        fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
    },
    {
        id: 7,
        toolName: 'activate_benefits',
        description: 'Ativar benefícios no cartão.',
        triggerText: 'Ativar benefícios no cartão.',
        fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
    },
    {
        id: 8,
        toolName: 'explain_proposal',
        description: 'Explicar o status e decisões da proposta.',
        triggerText: 'Explicar o status e decisões da proposta.',
        fields: [{ key: 'proposalId', prompt: 'Informe o ID da proposta.' }],
    },
];
function printOptions() {
    console.log('\nOpciones disponibles:');
    TOOL_OPTIONS.forEach((option) => console.log(` ${option.id} - ${option.description}`));
    console.log('');
}
function getSelectedOption(selection) {
    return TOOL_OPTIONS.find((option) => option.id === Number(selection));
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
function isCommandLikeInput(value) {
    const normalized = value.trim().toLowerCase();
    return RESERVED_COMMAND_WORDS.has(normalized);
}
function parseOfferType(value) {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'a')
        return 'A';
    if (normalized === 'b')
        return 'B';
    if (normalized === 'c')
        return 'C';
    return undefined;
}
function parseSelectedBenefits(value) {
    return value
        .split(',')
        .map((item) => item.trim().toUpperCase())
        .map((item) => {
        if (item === 'TRAVEL' || item === 'VIAGEM' || item === 'VIAJE')
            return 'TRAVEL_INSURANCE';
        if (item === 'VIP')
            return 'VIP_LOUNGE';
        if (item === 'LOUNGE')
            return 'VIP_LOUNGE';
        if (item === 'POINTS' || item === 'PONTOS')
            return 'POINTS';
        if (item === 'CASHBACK')
            return 'CASHBACK';
        return item;
    })
        .filter((item) => ['CASHBACK', 'POINTS', 'TRAVEL_INSURANCE', 'VIP_LOUNGE'].includes(item));
}
function setFieldValue(parameters, key, value) {
    switch (key) {
        case 'fullName':
        case 'nationalId':
        case 'email':
            parameters.customerProfile = {
                ...parameters.customerProfile,
                [key]: value.trim(),
            };
            break;
        case 'income':
        case 'investments':
        case 'currentAccountYears':
            parameters.customerProfile = {
                ...parameters.customerProfile,
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
const sessionState = {
    currentFieldIndex: 0,
    parameters: {},
};
async function bootstrap() {
    const appContext = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const assistant = appContext.get(chat_assistant_use_case_1.ChatAssistantUseCase);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> ',
    });
    console.log('Assistente de crédito no terminal. Digite "sair" para encerrar.');
    console.log('Selecione uma opção digitando seu número ou digite sua mensagem diretamente.');
    printOptions();
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
            printOptions();
            rl.prompt();
            return;
        }
        const selectedOption = getSelectedOption(message);
        if (sessionState.pendingOptionId) {
            const pendingOption = getSelectedOption(String(sessionState.pendingOptionId));
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
                const response = await assistant.executeTool(pendingOption.toolName, requestParameters);
                console.log(`\n[Assistente] ${response.message}`);
                if (response.toolName) {
                    console.log(`[Ferramenta] ${response.toolName}`);
                }
                if (response.toolResult !== undefined && response.toolResult !== null) {
                    console.log(`[Resultado] ${JSON.stringify(response.toolResult, null, 2)}`);
                    if (pendingOption.toolName === 'create_proposal' && typeof response.toolResult === 'object' && response.toolResult !== null) {
                        const createdProposalId = response.toolResult.proposalId;
                        if (typeof createdProposalId === 'string') {
                            sessionState.lastProposalId = createdProposalId;
                            console.log(`[ID da proposta] ${createdProposalId}`);
                        }
                    }
                }
            }
            catch (error) {
                console.error('Erro ao executar o assistente:', error);
            }
            printOptions();
            rl.prompt();
            return;
        }
        if (selectedOption) {
            sessionState.pendingOptionId = selectedOption.id;
            sessionState.currentFieldIndex = 0;
            sessionState.parameters = {};
            console.log(`\n${selectedOption.fields[0].prompt}`);
            rl.prompt();
            return;
        }
        if (/^\d+$/.test(message)) {
            console.log(`Opção inválida: ${message}. Por favor selecione um número válido.`);
            printOptions();
            rl.prompt();
            return;
        }
        const request = { userMessage: message };
        try {
            const response = await assistant.execute(request);
            console.log(`\n[Assistente] ${response.message}`);
            if (response.toolName) {
                console.log(`[Ferramenta] ${response.toolName}`);
            }
            if (response.toolResult !== undefined && response.toolResult !== null) {
                console.log(`[Resultado] ${JSON.stringify(response.toolResult, null, 2)}`);
            }
        }
        catch (error) {
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
