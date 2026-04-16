import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('outbox_events')
export class OutboxEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  eventType!: string;

  @Column('json')
  payload!: Record<string, unknown>;

  @Column()
  aggregateId!: string;

  @Column({ default: 'pending' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  processedAt?: Date;
}
