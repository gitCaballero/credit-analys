import { CreateProposalDto } from '../dto/create-proposal.dto';
import { ValidateBenefitsDto } from '../dto/validate-benefits.dto';
import { ProposalService } from '../services/proposal.service';
export declare class ProposalController {
    private readonly proposalService;
    constructor(proposalService: ProposalService);
    createProposal(payload: CreateProposalDto): Promise<import("../../../domain/entities/credit-card-proposal.entity").CreditCardProposal>;
    validateOffer(proposalId: string): Promise<{
        approved: boolean;
        reasons: string[];
        rejectedRules: string[];
        eligibleOffers: string[];
    }>;
    validateBenefits(proposalId: string, dto: ValidateBenefitsDto): Promise<{
        approved: boolean;
        reasons: string[];
        rejectedRules: string[];
        eligibleBenefits: string[];
    }>;
    submitProposal(proposalId: string): Promise<{
        proposalId: string;
        status: import("../../../domain/enums/proposal-status.enum").ProposalStatus.BENEFITS_VALIDATED;
    }>;
    createCardAccount(proposalId: string): Promise<{
        cardId: string | undefined;
        status: import("../../../domain/enums/card-creation-status.enum").CardCreationStatus.CREATED;
        reason?: undefined;
    } | {
        cardId: string | undefined;
        status: import("../../../domain/enums/card-creation-status.enum").CardCreationStatus.NOT_CREATED | import("../../../domain/enums/card-creation-status.enum").CardCreationStatus.REQUESTED | import("../../../domain/enums/card-creation-status.enum").CardCreationStatus.FAILED;
        reason: string | undefined;
    }>;
    activateBenefits(proposalId: string): Promise<{
        proposalId: string;
        cardId: string | undefined;
        statuses: Record<import("../../../domain/enums/benefit-type.enum").BenefitType, import("../../../domain/enums/benefit-activation-status.enum").BenefitActivationStatus>;
        completed: boolean;
    }>;
    getProposalStatus(proposalId: string): Promise<{
        proposalId: string;
        status: import("../../../domain/enums/proposal-status.enum").ProposalStatus;
        cardCreationStatus: import("../../../domain/enums/card-creation-status.enum").CardCreationStatus;
        selectedBenefits: import("../../../domain/enums/benefit-type.enum").BenefitType[];
        rejectionReason: string | undefined;
        cardId: string | undefined;
    }>;
    getProposalExplanation(proposalId: string): Promise<import("../../../application/ports/ai-assistant.adapter").AiAssistantResponse>;
}
