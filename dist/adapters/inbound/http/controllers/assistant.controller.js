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
exports.AssistantController = void 0;
const common_1 = require("@nestjs/common");
const assistant_dto_1 = require("../dto/assistant.dto");
let AssistantController = class AssistantController {
    constructor(assistantWorkflow) {
        this.assistantWorkflow = assistantWorkflow;
    }
    async handleMessage(payload) {
        return this.assistantWorkflow.execute(payload);
    }
    async handleCustomerMessage(payload) {
        return this.assistantWorkflow.execute({
            ...payload,
            audience: 'customer',
        });
    }
    async handleSpecialistMessage(payload) {
        return this.assistantWorkflow.execute({
            ...payload,
            audience: 'credit_specialist',
        });
    }
};
exports.AssistantController = AssistantController;
__decorate([
    (0, common_1.Post)('message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assistant_dto_1.AssistantMessageDto]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "handleMessage", null);
__decorate([
    (0, common_1.Post)('customer/message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assistant_dto_1.AssistantMessageDto]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "handleCustomerMessage", null);
__decorate([
    (0, common_1.Post)('specialist/message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assistant_dto_1.AssistantMessageDto]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "handleSpecialistMessage", null);
exports.AssistantController = AssistantController = __decorate([
    (0, common_1.Controller)('assistant'),
    __param(0, (0, common_1.Inject)('AssistantWorkflowPort')),
    __metadata("design:paramtypes", [Object])
], AssistantController);
