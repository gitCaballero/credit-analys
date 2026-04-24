import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { BenefitsPort } from '../ports/outbound/benefits.port';
import { ProposalRepository } from '../ports/outbound/proposal.repository.port';
import { OutboxEventPublisher } from '../services/outbox-event.publisher';
import { BenefitActivationStatus } from '../../domain/enums/benefit-activation-status.enum';
import { CardCreationStatus } from '../../domain/enums/card-creation-status.enum';
import { ProposalStatus } from '../../domain/enums/proposal-status.enum';

export class ActivateBenefitsUseCase {
  constructor(
    private readonly repository: ProposalRepository,
    private readonly benefitsPort: BenefitsPort,
    private readonly outboxPublisher: OutboxEventPublisher,
  ) {}

  async execute(proposalId: string) {
    const proposal = await this.repository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== ProposalStatus.CARD_ACCOUNT_CREATED) {
      throw new Error('Proposal must have a created card account before benefits activation');
    }

    if (proposal.cardCreationStatus !== CardCreationStatus.CREATED) {
      throw new Error('Card account must be created before benefits activation');
    }

    const activationResults = await Promise.all(
      proposal.selectedBenefits.benefits.map(async (benefit) => {
        const result = await this.benefitsPort.activateBenefit({
          proposalId: proposal.proposalId,
          cardId: proposal.cardId!,
          benefit,
        });

        proposal.setBenefitActivationStatus(
          benefit,
          result.success ? BenefitActivationStatus.ACTIVATED : BenefitActivationStatus.FAILED,
        );

        return result;
      }),
    );

    const allActivated = activationResults.every((result) => result.success);
    if (allActivated) {
      proposal.markCompleted();
    }

    await this.repository.save(proposal);
    await this.outboxPublisher.publish({
      eventType: 'benefits.activated',
      aggregateId: proposal.proposalId,
      payload: {
        proposalId: proposal.proposalId,
        activationResults: activationResults.map((result) => ({
          benefit: result.benefit,
          success: result.success,
          reason: result.reason,
        })),
      },
      occurredAt: new Date().toISOString(),
    });

    return {
      proposalId: proposal.proposalId,
      cardId: proposal.cardId,
      statuses: proposal.benefitActivationStatus,
      completed: allActivated,
    };
  }
}
