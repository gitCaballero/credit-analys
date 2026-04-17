import { AiAssistantResponse } from '../ports/ai-assistant.adapter';
import { AiAssistantService } from '../services/ai-assistant.service';
import { ProposalRepository } from '../ports/proposal.repository';
export declare class GenerateProposalExplanationUseCase {
    private readonly repository;
    private readonly aiAssistantService;
    constructor(repository: ProposalRepository, aiAssistantService: AiAssistantService);
    execute(proposalId: string): Promise<AiAssistantResponse | null>;
}
