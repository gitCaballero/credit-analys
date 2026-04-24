"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalService = void 0;
const common_1 = require("@nestjs/common");
const create_proposal_use_case_1 = require("../../../../application/use-cases/create-proposal.use-case");
const get_proposal_status_use_case_1 = require("../../../../application/use-cases/get-proposal-status.use-case");
const list_proposals_use_case_1 = require("../../../../application/use-cases/list-proposals.use-case");
const validate_offer_eligibility_use_case_1 = require("../../../../application/use-cases/validate-offer-eligibility.use-case");
const validate_benefits_use_case_1 = require("../../../../application/use-cases/validate-benefits.use-case");
const submit_proposal_use_case_1 = require("../../../../application/use-cases/submit-proposal.use-case");
const create_card_account_use_case_1 = require("../../../../application/use-cases/create-card-account.use-case");
const activate_benefits_use_case_1 = require("../../../../application/use-cases/activate-benefits.use-case");
const generate_proposal_explanation_use_case_1 = require("../../../../application/use-cases/generate-proposal-explanation.use-case");
const pii_util_1 = require("../../../../shared/security/pii.util");
let ProposalService = class ProposalService {
    constructor(createProposalUseCase, validateOfferEligibilityUseCase, validateBenefitSelectionUseCase, submitProposalUseCase, createCardAccountUseCase, activateBenefitsUseCase, getProposalStatusUseCase, listProposalsUseCase, generateProposalExplanationUseCase, repository) {
        this.createProposalUseCase = createProposalUseCase;
        this.validateOfferEligibilityUseCase = validateOfferEligibilityUseCase;
        this.validateBenefitSelectionUseCase = validateBenefitSelectionUseCase;
        this.submitProposalUseCase = submitProposalUseCase;
        this.createCardAccountUseCase = createCardAccountUseCase;
        this.activateBenefitsUseCase = activateBenefitsUseCase;
        this.getProposalStatusUseCase = getProposalStatusUseCase;
        this.listProposalsUseCase = listProposalsUseCase;
        this.generateProposalExplanationUseCase = generateProposalExplanationUseCase;
        this.repository = repository;
    }
    async createProposal(command) {
        try {
            const proposal = await this.createProposalUseCase.execute(command);
            return this.toCreateProposalResponse(proposal);
        }
        catch (error) {
            this.rethrowAsHttpException(error);
        }
    }
    async validateOffer(proposalId) {
        try {
            return await this.validateOfferEligibilityUseCase.execute(proposalId);
        }
        catch (error) {
            this.rethrowAsHttpException(error);
        }
    }
    async validateBenefits(proposalId, selectedBenefits) {
        try {
            return await this.validateBenefitSelectionUseCase.execute(proposalId, selectedBenefits);
        }
        catch (error) {
            this.rethrowAsHttpException(error);
        }
    }
    async submitProposal(proposalId) {
        try {
            return await this.submitProposalUseCase.execute(proposalId);
        }
        catch (error) {
            this.rethrowAsHttpException(error);
        }
    }
    async createCardAccount(proposalId) {
        try {
            return await this.createCardAccountUseCase.execute(proposalId);
        }
        catch (error) {
            this.rethrowAsHttpException(error);
        }
    }
    async activateBenefits(proposalId) {
        try {
            return await this.activateBenefitsUseCase.execute(proposalId);
        }
        catch (error) {
            this.rethrowAsHttpException(error);
        }
    }
    async getProposalStatus(proposalId) {
        return this.getProposalStatusUseCase.execute(proposalId);
    }
    async listProposals() {
        const proposals = await this.listProposalsUseCase.execute();
        return proposals.map((proposal) => ({
            ...proposal,
            customerProfile: {
                ...proposal.customerProfile,
                nationalId: (0, pii_util_1.maskNationalId)(proposal.customerProfile.nationalId),
                email: (0, pii_util_1.maskEmail)(proposal.customerProfile.email),
            },
        }));
    }
    async explainProposal(proposalId) {
        try {
            return await this.generateProposalExplanationUseCase.execute(proposalId);
        }
        catch (error) {
            this.rethrowAsHttpException(error);
        }
    }
    rethrowAsHttpException(error) {
        if (!(error instanceof Error)) {
            throw error;
        }
        if (/not found/i.test(error.message)) {
            throw new common_1.NotFoundException(error.message);
        }
        throw new common_1.BadRequestException(error.message);
    }
    toCreateProposalResponse(proposal) {
        return {
            proposalId: proposal.proposalId,
            customerProfile: {
                fullName: proposal.customerProfile.fullName,
                nationalId: (0, pii_util_1.maskNationalId)(proposal.customerProfile.nationalId),
                income: proposal.customerProfile.income,
                investments: proposal.customerProfile.investments,
                currentAccountYears: proposal.customerProfile.currentAccountYears,
                email: (0, pii_util_1.maskEmail)(proposal.customerProfile.email),
            },
            offerType: proposal.offerType,
            selectedBenefits: proposal.selectedBenefits.benefits,
            benefitActivationStatus: proposal.benefitActivationStatus,
            auditEntries: proposal.auditEntries,
            status: proposal.status,
            cardCreationStatus: proposal.cardCreationStatus,
            rejectionReason: proposal.rejectionReason,
            cardId: proposal.cardId,
        };
    }
};
exports.ProposalService = ProposalService;
exports.ProposalService = ProposalService = __decorate([
    (0, common_1.Injectable)(),
    __param(9, (0, common_1.Inject)('ProposalRepositoryPort')),
    __metadata("design:paramtypes", [create_proposal_use_case_1.CreateProposalUseCase,
        validate_offer_eligibility_use_case_1.ValidateOfferEligibilityUseCase,
        validate_benefits_use_case_1.ValidateBenefitSelectionUseCase,
        submit_proposal_use_case_1.SubmitProposalUseCase,
        create_card_account_use_case_1.CreateCardAccountUseCase,
        activate_benefits_use_case_1.ActivateBenefitsUseCase,
        get_proposal_status_use_case_1.GetProposalStatusUseCase,
        list_proposals_use_case_1.ListProposalsUseCase,
        generate_proposal_explanation_use_case_1.GenerateProposalExplanationUseCase, Object])
], ProposalService);
