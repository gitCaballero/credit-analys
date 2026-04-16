import OpenAI from 'openai';
import { ChatAssistantModelAdapter, ChatAssistantModelRequest, ChatAssistantModelResponse } from '../../application/ports/chat-assistant.adapter';

export class OpenAiChatModelAdapter implements ChatAssistantModelAdapter {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async interpretIntent(request: ChatAssistantModelRequest): Promise<ChatAssistantModelResponse> {
    const toolDescriptions = request.availableTools
      .map(
        (tool) => `- ${tool.name}: ${tool.description} Parámetros requeridos: ${tool.requiredParameters.join(', ')}`,
      )
      .join('\n');

    const prompt = `Eres un asistente de crédito que decide qué herramienta interna usar para resolver la solicitud del usuario. Responde únicamente con un JSON válido con las siguientes claves: toolName, toolInput y assistantMessage. No agregues texto extra fuera del JSON.

Herramientas disponibles:
${toolDescriptions}

Solicitud del usuario:
${request.userMessage}

Contexto adicional:
${request.proposalId ? `proposalId=${request.proposalId}` : 'sin proposalId'}
${request.parameters ? `
Parámetros adicionales: ${JSON.stringify(request.parameters)}` : ''}

Ejemplo de respuesta válida:
{"toolName":"check_status","toolInput":{"proposalId":"ABC123"},"assistantMessage":"Consulto el estado de tu propuesta."}`;

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
        assistantMessage: 'No pude interpretar tu solicitud en este momento. Intenta reformularla.',
      };
    }

    try {
      const parsed = JSON.parse(raw.trim());
      return {
        toolName: String(parsed.toolName || 'none'),
        toolInput: parsed.toolInput || {},
        assistantMessage: String(parsed.assistantMessage || 'He procesado tu solicitud.'),
      };
    } catch {
      return {
        toolName: 'none',
        toolInput: {},
        assistantMessage: 'No pude interpretar la respuesta del modelo. Intenta con una consulta más sencilla.',
      };
    }
  }
}
