export class AssistantMessageDto {
  userMessage!: string;
  proposalId?: string;
  parameters?: Record<string, unknown>;
  audience?: 'customer' | 'credit_specialist' | 'general';
}

export class AssistantResponseDto {
  message!: string;
  source!: string;
  toolName?: string;
  toolResult?: unknown;
  metadata?: Record<string, unknown>;
}
