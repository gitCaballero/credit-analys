import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('proposals')
@Unique(['proposalId'])
export class ProposalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  proposalId!: string;

  @Column()
  fullName!: string;

  @Column()
  nationalId!: string;

  @Column('numeric')
  income!: number;

  @Column('numeric')
  investments!: number;

  @Column('numeric')
  currentAccountYears!: number;

  @Column()
  email!: string;

  @Column()
  offerType!: string;

  @Column('simple-array', { nullable: true })
  selectedBenefits!: string[];

  @Column('json', { default: {} })
  benefitActivationStatus!: Record<string, string>;

  @Column()
  status!: string;

  @Column()
  cardCreationStatus!: string;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  cardId?: string;

  @Column('json', { default: [] })
  auditEntries!: Array<{ event: string; timestamp: string; detail: string; actor?: string }>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
