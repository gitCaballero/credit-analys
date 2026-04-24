import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProposalService } from '../../../src/adapters/inbound/http/services/proposal.service';

describe('ProposalService', () => {
  const createProposalUseCase = { execute: jest.fn() };
  const validateOfferEligibilityUseCase = { execute: jest.fn() };
  const validateBenefitSelectionUseCase = { execute: jest.fn() };
  const submitProposalUseCase = { execute: jest.fn() };
  const createCardAccountUseCase = { execute: jest.fn() };
  const activateBenefitsUseCase = { execute: jest.fn() };
  const getProposalStatusUseCase = { execute: jest.fn() };
  const listProposalsUseCase = { execute: jest.fn() };
  const generateProposalExplanationUseCase = { execute: jest.fn() };

  const service = new ProposalService(
    createProposalUseCase as any,
    validateOfferEligibilityUseCase as any,
    validateBenefitSelectionUseCase as any,
    submitProposalUseCase as any,
    createCardAccountUseCase as any,
    activateBenefitsUseCase as any,
    getProposalStatusUseCase as any,
    listProposalsUseCase as any,
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

  it('masks sensitive data in create proposal response', async () => {
    createProposalUseCase.execute.mockResolvedValue({
      proposalId: 'proposal-1',
      customerProfile: {
        fullName: 'Jane Doe',
        nationalId: '123456789',
        income: 4000,
        investments: 1000,
        currentAccountYears: 2,
        email: 'jane@example.com',
      },
      offerType: 'A',
      selectedBenefits: { benefits: ['CASHBACK'] },
      benefitActivationStatus: {},
      auditEntries: [],
      status: 'RECEIVED',
      cardCreationStatus: 'NOT_CREATED',
      rejectionReason: undefined,
      cardId: undefined,
    });

    const result = await service.createProposal({} as any);

    expect(result).toMatchObject({
      proposalId: 'proposal-1',
      customerProfile: {
        nationalId: '*****6789',
        email: 'j***@example.com',
      },
    });
  });

  it('masks sensitive data in specialist proposal listing', async () => {
    listProposalsUseCase.execute.mockResolvedValue([
      {
        proposalId: 'proposal-1',
        customerProfile: {
          fullName: 'Jane Doe',
          nationalId: '123456789',
          email: 'jane@example.com',
        },
        offerType: 'A',
        status: 'RECEIVED',
        cardCreationStatus: 'NOT_CREATED',
        selectedBenefits: ['CASHBACK'],
        benefitActivationStatus: {},
        rejectionReason: null,
        cardId: null,
      },
    ]);

    const result = await service.listProposals();

    expect(result).toEqual([
      expect.objectContaining({
        proposalId: 'proposal-1',
        customerProfile: expect.objectContaining({
          nationalId: '*****6789',
          email: 'j***@example.com',
        }),
      }),
    ]);
  });
});
