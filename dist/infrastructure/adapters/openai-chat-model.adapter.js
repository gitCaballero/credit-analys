"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiChatModelAdapter = void 0;
const openai_1 = __importDefault(require("openai"));
const pii_util_1 = require("../../shared/security/pii.util");
function sanitizeParameters(parameters) {
    if (!parameters) {
        return parameters;
    }
    const cloned = JSON.parse(JSON.stringify(parameters));
    const customerProfile = cloned.customerProfile;
    if (customerProfile) {
        if (typeof customerProfile.fullName === 'string') {
            customerProfile.fullName = `${customerProfile.fullName.charAt(0)}***`;
        }
        if (typeof customerProfile.nationalId === 'string') {
            customerProfile.nationalId = (0, pii_util_1.maskNationalId)(customerProfile.nationalId);
        }
        if (typeof customerProfile.email === 'string') {
            customerProfile.email = (0, pii_util_1.maskEmail)(customerProfile.email);
        }
    }
    return cloned;
}
class OpenAiChatModelAdapter {
    constructor() {
        this.client = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    }
    async interpretIntent(request) {
        const sanitizedParameters = sanitizeParameters(request.parameters);
        const toolDescriptions = request.availableTools
            .map((tool) => `- ${tool.name}: ${tool.description} Parâmetros requeridos: ${tool.requiredParameters.join(', ')}`)
            .join('\n');
        const prompt = `Você é um assistente de crédito que decide qual ferramenta interna usar para resolver a solicitação do usuário. Responda apenas com um JSON válido com as seguintes chaves: toolName, toolInput e assistantMessage. Não adicione texto extra fora do JSON.

Ferramentas disponíveis:
${toolDescriptions}

Solicitação do usuário:
${request.userMessage}

Contexto adicional:
${request.audience ? `audience=${request.audience}` : 'audience=general'}
${request.proposalId ? `proposalId=${request.proposalId}` : 'sem proposalId'}
${sanitizedParameters ? `
Parâmetros adicionais: ${JSON.stringify(sanitizedParameters)}` : ''}

Exemplo de resposta válida:
{"toolName":"check_status","toolInput":{"proposalId":"ABC123"},"assistantMessage":"Consulto o status da sua proposta."}`;
        const response = await this.client.responses.create({
            model: 'gpt-4.1',
            input: prompt,
            max_output_tokens: 1024,
        });
        const firstOutput = response.output?.[0] ?? null;
        const raw = firstOutput?.content?.find((item) => item.type === 'output_text')?.text ?? firstOutput?.output_text;
        if (!raw) {
            return {
                toolName: 'none',
                toolInput: {},
                assistantMessage: 'Não consegui interpretar sua solicitação no momento. Tente reformular.',
            };
        }
        try {
            const parsed = JSON.parse(raw.trim());
            return {
                toolName: String(parsed.toolName || 'none'),
                toolInput: parsed.toolInput || {},
                assistantMessage: String(parsed.assistantMessage || 'Processo sua solicitação.'),
            };
        }
        catch {
            return {
                toolName: 'none',
                toolInput: {},
                assistantMessage: 'Não consegui interpretar a resposta do modelo. Tente com uma consulta mais simples.',
            };
        }
    }
}
exports.OpenAiChatModelAdapter = OpenAiChatModelAdapter;
