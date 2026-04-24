import { AiAssistantResponse } from '../ports/outbound/ai-assistant.port';
import { AiAssistantService } from '../services/ai-assistant.service';
import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
export declare class GenerateProposalExplanationUseCase {
    private readonly repository;
    private readonly aiAssistantService;
    constructor(repository: ProposalRepository, aiAssistantService: AiAssistantService);
    execute(proposalId: string): Promise<AiAssistantResponse | null>;
}
