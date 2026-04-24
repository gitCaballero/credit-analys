import { CreateProposalCommand, CreateProposalUseCase } from '../../../../application/use-cases/create-proposal.use-case';
import { GetProposalStatusUseCase } from '../../../../application/use-cases/get-proposal-status.use-case';
import { ListProposalsUseCase } from '../../../../application/use-cases/list-proposals.use-case';
import { ValidateOfferEligibilityUseCase } from '../../../../application/use-cases/validate-offer-eligibility.use-case';
import { ValidateBenefitSelectionUseCase } from '../../../../application/use-cases/validate-benefits.use-case';
import { SubmitProposalUseCase } from '../../../../application/use-cases/submit-proposal.use-case';
import { CreateCardAccountUseCase } from '../../../../application/use-cases/create-card-account.use-case';
import { ActivateBenefitsUseCase } from '../../../../application/use-cases/activate-benefits.use-case';
import { GenerateProposalExplanationUseCase } from '../../../../application/use-cases/generate-proposal-explanation.use-case';
import { ProposalRepository } from '../../../../application/ports/outbound/proposal.repository.port';
import { BenefitType } from '../../../../domain/enums/benefit-type.enum';
import { ProposalWorkflowPort } from '../../../../application/ports/inbound/proposal-workflow.port';
export declare class ProposalService implements ProposalWorkflowPort {
    private readonly createProposalUseCase;
    private readonly validateOfferEligibilityUseCase;
    private readonly validateBenefitSelectionUseCase;
    private readonly submitProposalUseCase;
    private readonly createCardAccountUseCase;
    private readonly activateBenefitsUseCase;
    private readonly getProposalStatusUseCase;
    private readonly listProposalsUseCase;
    private readonly generateProposalExplanationUseCase;
    private readonly repository;
    constructor(createProposalUseCase: CreateProposalUseCase, validateOfferEligibilityUseCase: ValidateOfferEligibilityUseCase, validateBenefitSelectionUseCase: ValidateBenefitSelectionUseCase, submitProposalUseCase: SubmitProposalUseCase, createCardAccountUseCase: CreateCardAccountUseCase, activateBenefitsUseCase: ActivateBenefitsUseCase, getProposalStatusUseCase: GetProposalStatusUseCase, listProposalsUseCase: ListProposalsUseCase, generateProposalExplanationUseCase: GenerateProposalExplanationUseCase, repository: ProposalRepository);
    createProposal(command: CreateProposalCommand): Promise<{
        proposalId: string;
        customerProfile: {
            fullName: string;
            nationalId: string | undefined;
            income: number;
            investments: number;
            currentAccountYears: number;
            email: string | undefined;
        };
        offerType: import("../../../../domain/enums/offer-type.enum").OfferType;
        selectedBenefits: BenefitType[];
        benefitActivationStatus: Record<BenefitType, import("../../../../domain/enums/benefit-activation-status.enum").BenefitActivationStatus>;
        auditEntries: import("../../../../domain/entities/audit-entry.entity").AuditEntry[];
        status: import("../../../../domain/enums/proposal-status.enum").ProposalStatus;
        cardCreationStatus: import("../../../../domain/enums/card-creation-status.enum").CardCreationStatus;
        rejectionReason: string | undefined;
        cardId: string | undefined;
    }>;
    validateOffer(proposalId: string): Promise<{
        approved: boolean;
        reasons: string[];
        rejectedRules: string[];
        eligibleOffers: string[];
    }>;
    validateBenefits(proposalId: string, selectedBenefits: BenefitType[]): Promise<{
        approved: boolean;
        reasons: string[];
        rejectedRules: string[];
        eligibleBenefits: string[];
    }>;
    submitProposal(proposalId: string): Promise<{
        proposalId: string;
        status: import("../../../../domain/enums/proposal-status.enum").ProposalStatus.BENEFITS_VALIDATED;
    }>;
    createCardAccount(proposalId: string): Promise<{
        cardId: string | undefined;
        status: import("../../../../domain/enums/card-creation-status.enum").CardCreationStatus.CREATED;
        reason?: undefined;
    } | {
        cardId: string | undefined;
        status: import("../../../../domain/enums/card-creation-status.enum").CardCreationStatus.NOT_CREATED | import("../../../../domain/enums/card-creation-status.enum").CardCreationStatus.REQUESTED | import("../../../../domain/enums/card-creation-status.enum").CardCreationStatus.FAILED;
        reason: string | undefined;
    }>;
    activateBenefits(proposalId: string): Promise<{
        proposalId: string;
        cardId: string | undefined;
        statuses: Record<BenefitType, import("../../../../domain/enums/benefit-activation-status.enum").BenefitActivationStatus>;
        completed: boolean;
    }>;
    getProposalStatus(proposalId: string): Promise<{
        proposalId: string;
        status: import("../../../../domain/enums/proposal-status.enum").ProposalStatus;
        cardCreationStatus: import("../../../../domain/enums/card-creation-status.enum").CardCreationStatus;
        selectedBenefits: BenefitType[];
        benefitActivationStatus: Record<BenefitType, import("../../../../domain/enums/benefit-activation-status.enum").BenefitActivationStatus>;
        rejectionReason: string | undefined;
        cardId: string | undefined;
    } | null>;
    listProposals(): Promise<{
        customerProfile: {
            nationalId: string | undefined;
            email: string | undefined;
            fullName: string;
        };
        proposalId: string;
        offerType: import("../../../../domain/enums/offer-type.enum").OfferType;
        status: import("../../../../domain/enums/proposal-status.enum").ProposalStatus;
        cardCreationStatus: import("../../../../domain/enums/card-creation-status.enum").CardCreationStatus;
        selectedBenefits: BenefitType[];
        benefitActivationStatus: Record<BenefitType, import("../../../../domain/enums/benefit-activation-status.enum").BenefitActivationStatus>;
        rejectionReason: string | undefined;
        cardId: string | undefined;
    }[]>;
    explainProposal(proposalId: string): Promise<import("../../../../application/ports/outbound/ai-assistant.port").AiAssistantResponse | null>;
    private rethrowAsHttpException;
    private toCreateProposalResponse;
}
