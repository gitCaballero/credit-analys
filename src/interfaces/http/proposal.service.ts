import { Inject, Injectable } from '@nestjs/common';
import { CreateProposalCommand, CreateProposalUseCase } from '../../application/use-cases/create-proposal.use-case';
import { GetProposalStatusUseCase } from '../../application/use-cases/get-proposal-status.use-case';
import { ValidateOfferEligibilityUseCase } from '../../application/use-cases/validate-offer-eligibility.use-case';
import { ValidateBenefitSelectionUseCase } from '../../application/use-cases/validate-benefits.use-case';
import { SubmitProposalUseCase } from '../../application/use-cases/submit-proposal.use-case';
import { CreateCardAccountUseCase } from '../../application/use-cases/create-card-account.use-case';
import { ActivateBenefitsUseCase } from '../../application/use-cases/activate-benefits.use-case';
import { GenerateProposalExplanationUseCase } from '../../application/use-cases/generate-proposal-explanation.use-case';
import { ProposalRepository } from '../../application/ports/proposal.repository';
import { BenefitType } from '../../domain/enums/benefit-type.enum';

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
    return this.createProposalUseCase.execute(command);
  }

  async validateOffer(proposalId: string) {
    return this.validateOfferEligibilityUseCase.execute(proposalId);
  }

  async validateBenefits(proposalId: string, selectedBenefits: BenefitType[]) {
    return this.validateBenefitSelectionUseCase.execute(proposalId, selectedBenefits);
  }

  async submitProposal(proposalId: string) {
    return this.submitProposalUseCase.execute(proposalId);
  }

  async createCardAccount(proposalId: string) {
    return this.createCardAccountUseCase.execute(proposalId);
  }

  async activateBenefits(proposalId: string) {
    return this.activateBenefitsUseCase.execute(proposalId);
  }

  async getProposalStatus(proposalId: string) {
    return this.getProposalStatusUseCase.execute(proposalId);
  }

  async explainProposal(proposalId: string) {
    return this.generateProposalExplanationUseCase.execute(proposalId);
  }
}
