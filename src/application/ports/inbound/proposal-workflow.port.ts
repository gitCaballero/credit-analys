import { CreateProposalCommand } from '../../use-cases/create-proposal.use-case';
import { BenefitType } from '../../../domain/enums/benefit-type.enum';

export interface ProposalWorkflowPort {
  listProposals(): Promise<unknown>;
  createProposal(command: CreateProposalCommand): Promise<unknown>;
  validateOffer(proposalId: string): Promise<unknown>;
  validateBenefits(proposalId: string, selectedBenefits: BenefitType[]): Promise<unknown>;
  submitProposal(proposalId: string): Promise<unknown>;
  createCardAccount(proposalId: string): Promise<unknown>;
  activateBenefits(proposalId: string): Promise<unknown>;
  getProposalStatus(proposalId: string): Promise<unknown>;
  explainProposal(proposalId: string): Promise<unknown>;
}
