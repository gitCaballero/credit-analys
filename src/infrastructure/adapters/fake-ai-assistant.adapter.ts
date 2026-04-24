import {
  AiAssistantPort,
  AiAssistantRequest,
  AiAssistantResponse,
} from '../../application/ports/outbound/ai-assistant.port';

export class FakeAiAssistantAdapter implements AiAssistantPort {
  async generateProposalExplanation(
    request: AiAssistantRequest,
  ): Promise<AiAssistantResponse> {
    const { proposalId, offerType, proposalStatus, selectedBenefits, rejectionReason } = request;
    const benefitList = selectedBenefits.length > 0 ? selectedBenefits.join(', ') : 'no benefits selected';
    const explanationLines = [
      `Proposal ${proposalId} has status ${proposalStatus}.`,
      `Selected offer is ${offerType}.`,
      `Selected benefits: ${benefitList}.`,
    ];

    if (rejectionReason) {
      explanationLines.push(`The proposal was rejected because: ${rejectionReason}.`);
    }

    return {
      message: `The credit card proposal ${proposalId} is currently in status ${proposalStatus}.`,
      explanation: explanationLines.join(' '),
      source: 'fake-ai-assistant',
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
