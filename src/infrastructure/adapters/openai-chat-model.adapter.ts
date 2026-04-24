import OpenAI from 'openai';
import {
  ChatAssistantModelPort,
  ChatAssistantModelRequest,
  ChatAssistantModelResponse,
} from '../../application/ports/outbound/chat-assistant-model.port';
import { maskEmail, maskNationalId } from '../../shared/security/pii.util';

function sanitizeParameters(parameters?: Record<string, unknown>) {
  if (!parameters) {
    return parameters;
  }

  const cloned = JSON.parse(JSON.stringify(parameters)) as Record<string, unknown>;
  const customerProfile = cloned.customerProfile as Record<string, unknown> | undefined;
  if (customerProfile) {
    if (typeof customerProfile.fullName === 'string') {
      customerProfile.fullName = `${customerProfile.fullName.charAt(0)}***`;
    }
    if (typeof customerProfile.nationalId === 'string') {
      customerProfile.nationalId = maskNationalId(customerProfile.nationalId);
    }
    if (typeof customerProfile.email === 'string') {
      customerProfile.email = maskEmail(customerProfile.email);
    }
  }

  return cloned;
}

export class OpenAiChatModelAdapter implements ChatAssistantModelPort {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async interpretIntent(request: ChatAssistantModelRequest): Promise<ChatAssistantModelResponse> {
    const sanitizedParameters = sanitizeParameters(request.parameters);
    const toolDescriptions = request.availableTools
      .map(
        (tool) => `- ${tool.name}: ${tool.description} Parâmetros requeridos: ${tool.requiredParameters.join(', ')}`,
      )
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

    const firstOutput = (response.output?.[0] as any) ?? null;
    const raw = firstOutput?.content?.find((item: any) => item.type === 'output_text')?.text ?? firstOutput?.output_text;
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
    } catch {
      return {
        toolName: 'none',
        toolInput: {},
        assistantMessage: 'Não consegui interpretar a resposta do modelo. Tente com uma consulta mais simples.',
      };
    }
  }
}
