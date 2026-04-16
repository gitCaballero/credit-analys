import { DataSource } from 'typeorm';
import { OutboxEventEntity } from './entities/outbox-event.entity';
import { ProposalEntity } from './entities/proposal.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'credit_originacion',
  entities: [ProposalEntity, OutboxEventEntity],
  synchronize: true,
  logging: false,
});
