import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProposalCommand, CreateProposalUseCase } from '../../../../application/use-cases/create-proposal.use-case';
import { GetProposalStatusUseCase } from '../../../../application/use-cases/get-proposal-status.use-case';
import { ListProposalsUseCase } from '../../../../application/use-cases/list-proposals.use-case';
import { ValidateOfferEligibilityUseCase } from '../../../../application/use-cases/validate-offer-eligibility.use-case';
import { ValidateBenefitSelectionUseCase } from '../../../../application/use-cases/validate-benefits.use-case';
import { SubmitProposalUseCase } from '../../../../application/use-cases/submit-proposal.use-case';
import { CreateCardAccountUseCase } from '../../../../application/use-cases/create-card-account.use-case';
import { ActivateBenefitsUseCase } from '../../../../application/use-cases/activate-benefits.use-case';
import { GenerateProposalExplanationUseCase } from '../../../../application/use-cases/generate-proposal-explanation.use-case';
import { ProposalRepository } from '../../../../application/ports/outbound/proposal.repository.port';
import { BenefitType } from '../../../../domain/enums/benefit-type.enum';
import { CreditCardProposal } from '../../../../domain/entities/credit-card-proposal.entity';
import { maskEmail, maskNationalId } from '../../../../shared/security/pii.util';
import { ProposalWorkflowPort } from '../../../../application/ports/inbound/proposal-workflow.port';

@Injectable()
export class ProposalService implements ProposalWorkflowPort {
  constructor(
    private readonly createProposalUseCase: CreateProposalUseCase,
    private readonly validateOfferEligibilityUseCase: ValidateOfferEligibilityUseCase,
    private readonly validateBenefitSelectionUseCase: ValidateBenefitSelectionUseCase,
    private readonly submitProposalUseCase: SubmitProposalUseCase,
    private readonly createCardAccountUseCase: CreateCardAccountUseCase,
    private readonly activateBenefitsUseCase: ActivateBenefitsUseCase,
    private readonly getProposalStatusUseCase: GetProposalStatusUseCase,
    private readonly listProposalsUseCase: ListProposalsUseCase,
    private readonly generateProposalExplanationUseCase: GenerateProposalExplanationUseCase,
    @Inject('ProposalRepositoryPort') private readonly repository: ProposalRepository,
  ) {}

  async createProposal(command: CreateProposalCommand) {
    try {
      const proposal = await this.createProposalUseCase.execute(command);
      return this.toCreateProposalResponse(proposal);
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

  async listProposals() {
    const proposals = await this.listProposalsUseCase.execute();
    return proposals.map((proposal) => ({
      ...proposal,
      customerProfile: {
        ...proposal.customerProfile,
        nationalId: maskNationalId(proposal.customerProfile.nationalId),
        email: maskEmail(proposal.customerProfile.email),
      },
    }));
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

  private toCreateProposalResponse(proposal: CreditCardProposal) {
    return {
      proposalId: proposal.proposalId,
      customerProfile: {
        fullName: proposal.customerProfile.fullName,
        nationalId: maskNationalId(proposal.customerProfile.nationalId),
        income: proposal.customerProfile.income,
        investments: proposal.customerProfile.investments,
        currentAccountYears: proposal.customerProfile.currentAccountYears,
        email: maskEmail(proposal.customerProfile.email),
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
}
