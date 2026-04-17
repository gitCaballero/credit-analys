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
exports.ProposalController = void 0;
const common_1 = require("@nestjs/common");
const create_proposal_dto_1 = require("../dto/create-proposal.dto");
const validate_benefits_dto_1 = require("../dto/validate-benefits.dto");
const proposal_service_1 = require("../services/proposal.service");
let ProposalController = class ProposalController {
    constructor(proposalService) {
        this.proposalService = proposalService;
    }
    async createProposal(payload) {
        return this.proposalService.createProposal(payload);
    }
    async validateOffer(proposalId) {
        const result = await this.proposalService.validateOffer(proposalId);
        if (!result) {
            throw new common_1.NotFoundException(`Proposal ${proposalId} not found`);
        }
        return result;
    }
    async validateBenefits(proposalId, dto) {
        const result = await this.proposalService.validateBenefits(proposalId, dto.selectedBenefits);
        if (!result) {
            throw new common_1.NotFoundException(`Proposal ${proposalId} not found`);
        }
        return result;
    }
    async submitProposal(proposalId) {
        return this.proposalService.submitProposal(proposalId);
    }
    async createCardAccount(proposalId) {
        return this.proposalService.createCardAccount(proposalId);
    }
    async activateBenefits(proposalId) {
        return this.proposalService.activateBenefits(proposalId);
    }
    async getProposalStatus(proposalId) {
        const result = await this.proposalService.getProposalStatus(proposalId);
        if (!result) {
            throw new common_1.NotFoundException(`Proposal ${proposalId} not found`);
        }
        return result;
    }
    async getProposalExplanation(proposalId) {
        const result = await this.proposalService.explainProposal(proposalId);
        if (!result) {
            throw new common_1.NotFoundException(`Proposal ${proposalId} not found`);
        }
        return result;
    }
};
exports.ProposalController = ProposalController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_proposal_dto_1.CreateProposalDto]),
    __metadata("design:returntype", Promise)
], ProposalController.prototype, "createProposal", null);
__decorate([
    (0, common_1.Post)(':proposalId/offer-validation'),
    __param(0, (0, common_1.Param)('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProposalController.prototype, "validateOffer", null);
__decorate([
    (0, common_1.Post)(':proposalId/benefits-validation'),
    __param(0, (0, common_1.Param)('proposalId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, validate_benefits_dto_1.ValidateBenefitsDto]),
    __metadata("design:returntype", Promise)
], ProposalController.prototype, "validateBenefits", null);
__decorate([
    (0, common_1.Post)(':proposalId/submit'),
    __param(0, (0, common_1.Param)('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProposalController.prototype, "submitProposal", null);
__decorate([
    (0, common_1.Post)(':proposalId/card-creation'),
    __param(0, (0, common_1.Param)('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProposalController.prototype, "createCardAccount", null);
__decorate([
    (0, common_1.Post)(':proposalId/benefits-activation'),
    __param(0, (0, common_1.Param)('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProposalController.prototype, "activateBenefits", null);
__decorate([
    (0, common_1.Get)(':proposalId/status'),
    __param(0, (0, common_1.Param)('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProposalController.prototype, "getProposalStatus", null);
__decorate([
    (0, common_1.Get)(':proposalId/explanation'),
    __param(0, (0, common_1.Param)('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProposalController.prototype, "getProposalExplanation", null);
exports.ProposalController = ProposalController = __decorate([
    (0, common_1.Controller)('proposals'),
    __metadata("design:paramtypes", [proposal_service_1.ProposalService])
], ProposalController);
