import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { ProposalStatus } from '../../domain/enums/proposal-status.enum';
export interface AiAssistantRequest {
    proposalId: string;
    offerType: string;
    proposalStatus: ProposalStatus;
    cardCreationStatus: string;
    selectedBenefits: BenefitType[];
    benefitActivationStatus: Record<string, string>;
    rejectionReason?: string;
    auditTrail: Array<{
        event: string;
        detail: string;
        timestamp: string;
        actor?: string;
    }>;
    correlationId?: string;
}
export interface AiAssistantResponse {
    message: string;
    explanation: string;
    source: string;
    metadata?: Record<string, unknown>;
}
export interface AiAssistantAdapter {
    generateProposalExplanation(request: AiAssistantRequest): Promise<AiAssistantResponse>;
}
