import { Body, Controller, Get, Inject, NotFoundException, Param, Post } from '@nestjs/common';
import { CreateProposalDto } from '../dto/create-proposal.dto';
import { ValidateBenefitsDto } from '../dto/validate-benefits.dto';
import { ProposalWorkflowPort } from '../../../../application/ports/inbound/proposal-workflow.port';

@Controller('proposals')
export class ProposalController {
  constructor(
    @Inject('ProposalWorkflowPort')
    private readonly proposalWorkflow: ProposalWorkflowPort,
  ) {}

  @Get()
  async listProposals() {
    return this.proposalWorkflow.listProposals();
  }

  @Post()
  async createProposal(@Body() payload: CreateProposalDto) {
    return this.proposalWorkflow.createProposal(payload);
  }

  @Post(':proposalId/offer-validation')
  async validateOffer(@Param('proposalId') proposalId: string) {
    const result = await this.proposalWorkflow.validateOffer(proposalId);
    if (!result) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }
    return result;
  }

  @Post(':proposalId/benefits-validation')
  async validateBenefits(@Param('proposalId') proposalId: string, @Body() dto: ValidateBenefitsDto) {
    const result = await this.proposalWorkflow.validateBenefits(proposalId, dto.selectedBenefits);
    if (!result) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }
    return result;
  }

  @Post(':proposalId/submit')
  async submitProposal(@Param('proposalId') proposalId: string) {
    return this.proposalWorkflow.submitProposal(proposalId);
  }

  @Post(':proposalId/card-creation')
  async createCardAccount(@Param('proposalId') proposalId: string) {
    return this.proposalWorkflow.createCardAccount(proposalId);
  }

  @Post(':proposalId/benefits-activation')
  async activateBenefits(@Param('proposalId') proposalId: string) {
    return this.proposalWorkflow.activateBenefits(proposalId);
  }

  @Get(':proposalId/status')
  async getProposalStatus(@Param('proposalId') proposalId: string) {
    const result = await this.proposalWorkflow.getProposalStatus(proposalId);
    if (!result) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }
    return result;
  }

  @Get(':proposalId/explanation')
  async getProposalExplanation(@Param('proposalId') proposalId: string) {
    const result = await this.proposalWorkflow.explainProposal(proposalId);
    if (!result) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }
    return result;
  }
}
