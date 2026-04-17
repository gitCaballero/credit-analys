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
exports.ValidateBenefitsDto = void 0;
const class_validator_1 = require("class-validator");
const benefit_type_enum_1 = require("../../../domain/enums/benefit-type.enum");
/**
 * DTO de requisição para validar os benefícios selecionados de uma proposta existente.
 */
class ValidateBenefitsDto {
}
exports.ValidateBenefitsDto = ValidateBenefitsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(benefit_type_enum_1.BenefitType, { each: true })
    /** Lista de tipos de benefício selecionados pelo cliente. */
    ,
    __metadata("design:type", Array)
], ValidateBenefitsDto.prototype, "selectedBenefits", void 0);
