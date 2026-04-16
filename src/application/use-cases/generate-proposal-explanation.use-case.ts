import { Injectable } from '@nestjs/common';
import { AiAssistantResponse } from '../ports/ai-assistant.adapter';
import { AiAssistantService } from '../services/ai-assistant.service';
import { ProposalRepository } from '../ports/proposal.repository';

@Injectable()
export class GenerateProposalExplanationUseCase {
  constructor(
    private readonly repository: ProposalRepository,
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  async execute(proposalId: string): Promise<AiAssistantResponse | null> {
    const proposal = await this.repository.findById(proposalId);
    if (!proposal) {
      return null;
    }

    const request = {
      proposalId: proposal.proposalId,
      offerType: proposal.offerType,
      proposalStatus: proposal.status,
      cardCreationStatus: proposal.cardCreationStatus,
      selectedBenefits: proposal.selectedBenefits.benefits,
      benefitActivationStatus: proposal.benefitActivationStatus,
      rejectionReason: proposal.rejectionReason,
      auditTrail: proposal.auditEntries.map((entry) => ({
        event: entry.event,
        detail: entry.detail,
        timestamp: entry.timestamp.toISOString(),
        actor: entry.actor,
      })),
      correlationId: undefined,
    };

    return this.aiAssistantService.explainProposal(request);
  }
}
