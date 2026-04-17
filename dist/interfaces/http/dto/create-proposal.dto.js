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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProposalDto = exports.CustomerProfileDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const offer_type_enum_1 = require("../../../domain/enums/offer-type.enum");
const benefit_type_enum_1 = require("../../../domain/enums/benefit-type.enum");
/**
 * DTO com os dados do perfil do cliente enviados na criação da proposta.
 */
class CustomerProfileDto {
}
exports.CustomerProfileDto = CustomerProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
    /** Nome completo do cliente. */
    ,
    __metadata("design:type", String)
], CustomerProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
    /** Documento de identificação nacional do cliente. */
    ,
    __metadata("design:type", String)
], CustomerProfileDto.prototype, "nationalId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0)
    /** Valor da renda do cliente. */
    ,
    __metadata("design:type", Number)
], CustomerProfileDto.prototype, "income", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0)
    /** Total de investimentos do cliente. */
    ,
    __metadata("design:type", Number)
], CustomerProfileDto.prototype, "investments", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0)
    /** Quantidade de anos em que o cliente mantém conta corrente. */
    ,
    __metadata("design:type", Number)
], CustomerProfileDto.prototype, "currentAccountYears", void 0);
__decorate([
    (0, class_validator_1.IsEmail)()
    /** Endereço de e-mail do cliente. */
    ,
    __metadata("design:type", String)
], CustomerProfileDto.prototype, "email", void 0);
/**
 * DTO de requisição para criar uma nova proposta de cartão de crédito.
 */
class CreateProposalDto {
}
exports.CreateProposalDto = CreateProposalDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
    /** Identificador único da proposta. */
    ,
    __metadata("design:type", String)
], CreateProposalDto.prototype, "proposalId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CustomerProfileDto)
    /** Payload com os dados do perfil do cliente. */
    ,
    __metadata("design:type", CustomerProfileDto)
], CreateProposalDto.prototype, "customerProfile", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(offer_type_enum_1.OfferType)
    /** Tipo de oferta selecionado para esta proposta. */
    ,
    __metadata("design:type", String)
], CreateProposalDto.prototype, "offerType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsEnum)(benefit_type_enum_1.BenefitType, { each: true })
    /** Benefícios selecionados para a proposta. */
    ,
    __metadata("design:type", Array)
], CreateProposalDto.prototype, "selectedBenefits", void 0);
