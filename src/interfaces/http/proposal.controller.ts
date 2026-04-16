import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { ValidateBenefitsDto } from './dto/validate-benefits.dto';
import { ProposalService } from './proposal.service';

@Controller('proposals')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post()
  async createProposal(@Body() payload: CreateProposalDto) {
    return this.proposalService.createProposal(payload);
  }

  @Post(':proposalId/offer-validation')
  async validateOffer(@Param('proposalId') proposalId: string) {
    const result = await this.proposalService.validateOffer(proposalId);
    if (!result) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }
    return result;
  }

  @Post(':proposalId/benefits-validation')
  async validateBenefits(@Param('proposalId') proposalId: string, @Body() dto: ValidateBenefitsDto) {
    const result = await this.proposalService.validateBenefits(proposalId, dto.selectedBenefits);
    if (!result) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }
    return result;
  }

  @Post(':proposalId/submit')
  async submitProposal(@Param('proposalId') proposalId: string) {
    return this.proposalService.submitProposal(proposalId);
  }

  @Post(':proposalId/card-creation')
  async createCardAccount(@Param('proposalId') proposalId: string) {
    return this.proposalService.createCardAccount(proposalId);
  }

  @Post(':proposalId/benefits-activation')
  async activateBenefits(@Param('proposalId') proposalId: string) {
    return this.proposalService.activateBenefits(proposalId);
  }

  @Get(':proposalId/status')
  async getProposalStatus(@Param('proposalId') proposalId: string) {
    const result = await this.proposalService.getProposalStatus(proposalId);
    if (!result) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }
    return result;
  }

  @Get(':proposalId/explanation')
  async getProposalExplanation(@Param('proposalId') proposalId: string) {
    const result = await this.proposalService.explainProposal(proposalId);
    if (!result) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }
    return result;
  }
}
