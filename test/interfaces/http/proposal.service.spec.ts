import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProposalService } from '../../../src/interfaces/http/proposal.service';

describe('ProposalService', () => {
  const createProposalUseCase = { execute: jest.fn() };
  const validateOfferEligibilityUseCase = { execute: jest.fn() };
  const validateBenefitSelectionUseCase = { execute: jest.fn() };
  const submitProposalUseCase = { execute: jest.fn() };
  const createCardAccountUseCase = { execute: jest.fn() };
  const activateBenefitsUseCase = { execute: jest.fn() };
  const getProposalStatusUseCase = { execute: jest.fn() };
  const generateProposalExplanationUseCase = { execute: jest.fn() };

  const service = new ProposalService(
    createProposalUseCase as any,
    validateOfferEligibilityUseCase as any,
    validateBenefitSelectionUseCase as any,
    submitProposalUseCase as any,
    createCardAccountUseCase as any,
    activateBenefitsUseCase as any,
    getProposalStatusUseCase as any,
    generateProposalExplanationUseCase as any,
    {} as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps not found use case errors to NotFoundException', async () => {
    validateOfferEligibilityUseCase.execute.mockRejectedValue(new Error('Proposal missing-1 not found'));

    await expect(service.validateOffer('missing-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps invalid transition errors to BadRequestException', async () => {
    submitProposalUseCase.execute.mockRejectedValue(
      new Error('Proposal must complete benefits validation before submission'),
    );

    await expect(service.submitProposal('proposal-1')).rejects.toBeInstanceOf(BadRequestException);
  });
});
