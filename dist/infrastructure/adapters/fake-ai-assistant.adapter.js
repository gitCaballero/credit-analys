"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeAiAssistantAdapter = void 0;
class FakeAiAssistantAdapter {
    async generateProposalExplanation(request) {
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
exports.FakeAiAssistantAdapter = FakeAiAssistantAdapter;
