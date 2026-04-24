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
exports.TypeormProposalRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const credit_card_proposal_entity_1 = require("../../domain/entities/credit-card-proposal.entity");
const customer_profile_entity_1 = require("../../domain/entities/customer-profile.entity");
const proposal_entity_1 = require("../typeorm/entities/proposal.entity");
let TypeormProposalRepository = class TypeormProposalRepository {
    constructor(repository) {
        this.repository = repository;
    }
    toDomain(entity) {
        const customerProfile = new customer_profile_entity_1.CustomerProfile(entity.fullName, entity.nationalId, Number(entity.income), Number(entity.investments), Number(entity.currentAccountYears), entity.email);
        const selectedBenefits = (entity.selectedBenefits || []).map((benefit) => benefit);
        const proposal = new credit_card_proposal_entity_1.CreditCardProposal(entity.proposalId, customerProfile, entity.offerType, selectedBenefits);
        proposal.status = entity.status;
        proposal.cardCreationStatus = entity.cardCreationStatus;
        proposal.rejectionReason = entity.rejectionReason;
        proposal.cardId = entity.cardId;
        proposal.auditEntries.push(...(entity.auditEntries || []).map((entry) => ({
            event: entry.event,
            timestamp: new Date(entry.timestamp),
            detail: entry.detail,
            actor: entry.actor,
        })));
        Object.entries(entity.benefitActivationStatus || {}).forEach(([benefit, status]) => {
            proposal.benefitActivationStatus[benefit] = status;
        });
        return proposal;
    }
    toEntity(proposal) {
        const entity = new proposal_entity_1.ProposalEntity();
        entity.proposalId = proposal.proposalId;
        entity.fullName = proposal.customerProfile.fullName;
        entity.nationalId = proposal.customerProfile.nationalId;
        entity.income = proposal.customerProfile.income;
        entity.investments = proposal.customerProfile.investments;
        entity.currentAccountYears = proposal.customerProfile.currentAccountYears;
        entity.email = proposal.customerProfile.email;
        entity.offerType = proposal.offerType;
        entity.selectedBenefits = proposal.selectedBenefits.benefits;
        entity.benefitActivationStatus = proposal.benefitActivationStatus;
        entity.status = proposal.status;
        entity.cardCreationStatus = proposal.cardCreationStatus;
        entity.rejectionReason = proposal.rejectionReason;
        entity.cardId = proposal.cardId;
        entity.auditEntries = proposal.auditEntries.map((entry) => ({
            event: entry.event,
            timestamp: entry.timestamp.toISOString(),
            detail: entry.detail,
            actor: entry.actor,
        }));
        return entity;
    }
    async save(proposal) {
        const existing = await this.repository.findOne({ where: { proposalId: proposal.proposalId } });
        if (existing) {
            const entity = this.toEntity(proposal);
            entity.id = existing.id;
            await this.repository.save(entity);
            return;
        }
        const entity = this.toEntity(proposal);
        await this.repository.save(entity);
    }
    async findById(proposalId) {
        const entity = await this.repository.findOne({ where: { proposalId } });
        return entity ? this.toDomain(entity) : null;
    }
    async findAll() {
        const entities = await this.repository.find({
            order: {
                updatedAt: 'DESC',
            },
        });
        return entities.map((entity) => this.toDomain(entity));
    }
};
exports.TypeormProposalRepository = TypeormProposalRepository;
exports.TypeormProposalRepository = TypeormProposalRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(proposal_entity_1.ProposalEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeormProposalRepository);
