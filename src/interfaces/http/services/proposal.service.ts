import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProposalCommand, CreateProposalUseCase } from '../../../application/use-cases/create-proposal.use-case';
import { GetProposalStatusUseCase } from '../../../application/use-cases/get-proposal-status.use-case';
import { ValidateOfferEligibilityUseCase } from '../../../application/use-cases/validate-offer-eligibility.use-case';
import { ValidateBenefitSelectionUseCase } from '../../../application/use-cases/validate-benefits.use-case';
import { SubmitProposalUseCase } from '../../../application/use-cases/submit-proposal.use-case';
import { CreateCardAccountUseCase } from '../../../application/use-cases/create-card-account.use-case';
import { ActivateBenefitsUseCase } from '../../../application/use-cases/activate-benefits.use-case';
import { GenerateProposalExplanationUseCase } from '../../../application/use-cases/generate-proposal-explanation.use-case';
import { ProposalRepository } from '../../../application/ports/proposal.repository';
import { BenefitType } from '../../../domain/enums/benefit-type.enum';

@Injectable()
export class ProposalService {
  constructor(
    private readonly createProposalUseCase: CreateProposalUseCase,
    private readonly validateOfferEligibilityUseCase: ValidateOfferEligibilityUseCase,
    private readonly validateBenefitSelectionUseCase: ValidateBenefitSelectionUseCase,
    private readonly submitProposalUseCase: SubmitProposalUseCase,
    private readonly createCardAccountUseCase: CreateCardAccountUseCase,
    private readonly activateBenefitsUseCase: ActivateBenefitsUseCase,
    private readonly getProposalStatusUseCase: GetProposalStatusUseCase,
    private readonly generateProposalExplanationUseCase: GenerateProposalExplanationUseCase,
    @Inject('ProposalRepository') private readonly repository: ProposalRepository,
  ) {}

  async createProposal(command: CreateProposalCommand) {
    try {
      return await this.createProposalUseCase.execute(command);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  async validateOffer(proposalId: string) {
    try {
      return await this.validateOfferEligibilityUseCase.execute(proposalId);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  async validateBenefits(proposalId: string, selectedBenefits: BenefitType[]) {
    try {
      return await this.validateBenefitSelectionUseCase.execute(proposalId, selectedBenefits);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  async submitProposal(proposalId: string) {
    try {
      return await this.submitProposalUseCase.execute(proposalId);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  async createCardAccount(proposalId: string) {
    try {
      return await this.createCardAccountUseCase.execute(proposalId);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  async activateBenefits(proposalId: string) {
    try {
      return await this.activateBenefitsUseCase.execute(proposalId);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  async getProposalStatus(proposalId: string) {
    return this.getProposalStatusUseCase.execute(proposalId);
  }

  async explainProposal(proposalId: string) {
    try {
      return await this.generateProposalExplanationUseCase.execute(proposalId);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  private rethrowAsHttpException(error: unknown): never {
    if (!(error instanceof Error)) {
      throw error;
    }

    if (/not found/i.test(error.message)) {
      throw new NotFoundException(error.message);
    }

    throw new BadRequestException(error.message);
  }
}
