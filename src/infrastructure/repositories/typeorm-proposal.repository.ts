import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardProposal } from '../../domain/entities/credit-card-proposal.entity';
import { CustomerProfile } from '../../domain/entities/customer-profile.entity';
import { BenefitActivationStatus } from '../../domain/enums/benefit-activation-status.enum';
import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { CardCreationStatus } from '../../domain/enums/card-creation-status.enum';
import { OfferType } from '../../domain/enums/offer-type.enum';
import { ProposalStatus } from '../../domain/enums/proposal-status.enum';
import { ProposalRepository } from '../../application/ports/outbound/proposal.repository.port';
import { ProposalEntity } from '../typeorm/entities/proposal.entity';

@Injectable()
export class TypeormProposalRepository implements ProposalRepository {
  constructor(
    @InjectRepository(ProposalEntity)
    private readonly repository: Repository<ProposalEntity>,
  ) {}

  private toDomain(entity: ProposalEntity): CreditCardProposal {
    const customerProfile = new CustomerProfile(
      entity.fullName,
      entity.nationalId,
      Number(entity.income),
      Number(entity.investments),
      Number(entity.currentAccountYears),
      entity.email,
    );

    const selectedBenefits: BenefitType[] = (entity.selectedBenefits || []).map(
      (benefit) => benefit as BenefitType,
    );

    const proposal = new CreditCardProposal(
      entity.proposalId,
      customerProfile,
      entity.offerType as OfferType,
      selectedBenefits,
    );

    proposal.status = entity.status as ProposalStatus;
    proposal.cardCreationStatus = entity.cardCreationStatus as CardCreationStatus;
    proposal.rejectionReason = entity.rejectionReason;
    proposal.cardId = entity.cardId;
    proposal.auditEntries.push(...(entity.auditEntries || []).map((entry) => ({
      event: entry.event,
      timestamp: new Date(entry.timestamp),
      detail: entry.detail,
      actor: entry.actor,
    })));

    Object.entries(entity.benefitActivationStatus || {}).forEach(([benefit, status]) => {
      proposal.benefitActivationStatus[benefit as BenefitType] = status as BenefitActivationStatus;
    });

    return proposal;
  }

  private toEntity(proposal: CreditCardProposal): ProposalEntity {
    const entity = new ProposalEntity();
    entity.proposalId = proposal.proposalId;
    entity.fullName = proposal.customerProfile.fullName;
    entity.nationalId = proposal.customerProfile.nationalId;
    entity.income = proposal.customerProfile.income;
    entity.investments = proposal.customerProfile.investments;
    entity.currentAccountYears = proposal.customerProfile.currentAccountYears;
    entity.email = proposal.customerProfile.email;
    entity.offerType = proposal.offerType;
    entity.selectedBenefits = proposal.selectedBenefits.benefits;
    entity.benefitActivationStatus = proposal.benefitActivationStatus;
    entity.status = proposal.status;
    entity.cardCreationStatus = proposal.cardCreationStatus;
    entity.rejectionReason = proposal.rejectionReason;
    entity.cardId = proposal.cardId;
    entity.auditEntries = proposal.auditEntries.map((entry) => ({
      event: entry.event,
      timestamp: entry.timestamp.toISOString(),
      detail: entry.detail,
      actor: entry.actor,
    }));
    return entity;
  }

  async save(proposal: CreditCardProposal): Promise<void> {
    const existing = await this.repository.findOne({ where: { proposalId: proposal.proposalId } });
    if (existing) {
      const entity = this.toEntity(proposal);
      entity.id = existing.id;
      await this.repository.save(entity);
      return;
    }

    const entity = this.toEntity(proposal);
    await this.repository.save(entity);
  }

  async findById(proposalId: string): Promise<CreditCardProposal | null> {
    const entity = await this.repository.findOne({ where: { proposalId } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<CreditCardProposal[]> {
    const entities = await this.repository.find({
      order: {
        updatedAt: 'DESC',
      },
    });

    return entities.map((entity) => this.toDomain(entity));
  }
}
