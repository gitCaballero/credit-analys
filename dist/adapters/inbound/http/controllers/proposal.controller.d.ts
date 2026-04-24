import { CreateProposalDto } from '../dto/create-proposal.dto';
import { ValidateBenefitsDto } from '../dto/validate-benefits.dto';
import { ProposalWorkflowPort } from '../../../../application/ports/inbound/proposal-workflow.port';
export declare class ProposalController {
    private readonly proposalWorkflow;
    constructor(proposalWorkflow: ProposalWorkflowPort);
    listProposals(): Promise<unknown>;
    createProposal(payload: CreateProposalDto): Promise<unknown>;
    validateOffer(proposalId: string): Promise<{}>;
    validateBenefits(proposalId: string, dto: ValidateBenefitsDto): Promise<{}>;
    submitProposal(proposalId: string): Promise<unknown>;
    createCardAccount(proposalId: string): Promise<unknown>;
    activateBenefits(proposalId: string): Promise<unknown>;
    getProposalStatus(proposalId: string): Promise<{}>;
    getProposalExplanation(proposalId: string): Promise<{}>;
}
