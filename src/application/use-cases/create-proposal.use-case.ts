import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { CustomerProfile } from '../../domain/entities/customer-profile.entity';
import { OfferType } from '../../domain/enums/offer-type.enum';
import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { ProposalRepository } from '../ports/proposal.repository';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';

export interface CreateProposalCommand {
  proposalId: string;
  customerProfile: {
    fullName: string;
    nationalId: string;
    income: number;
    investments: number;
    currentAccountYears: number;
    email: string;
  };
  offerType: OfferType;
  selectedBenefits: BenefitType[];
}

export class CreateProposalUseCase {
  constructor(
    private readonly repository: ProposalRepository,
    private readonly outboxPublisher: OutboxEventPublisher,
  ) {}

  async execute(command: CreateProposalCommand): Promise<CreditCardProposal> {
    const profile = new CustomerProfile(
      command.customerProfile.fullName,
      command.customerProfile.nationalId,
      command.customerProfile.income,
      command.customerProfile.investments,
      command.customerProfile.currentAccountYears,
      command.customerProfile.email,
    );

    const proposal = new CreditCardProposal(command.proposalId, profile, command.offerType, command.selectedBenefits);
    proposal.addAudit('proposal.created', 'Proposal entity created');
    await this.repository.save(proposal);
    await this.outboxPublisher.publish({
      eventType: 'proposal.received',
      aggregateId: proposal.proposalId,
      payload: {
        proposalId: proposal.proposalId,
        offerType: proposal.offerType,
        selectedBenefits: proposal.selectedBenefits.benefits,
      },
      occurredAt: new Date().toISOString(),
    });
    return proposal;
  }
}
