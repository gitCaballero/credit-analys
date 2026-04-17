"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const outbox_event_entity_1 = require("./entities/outbox-event.entity");
const proposal_entity_1 = require("./entities/proposal.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'credit_originacion',
    entities: [proposal_entity_1.ProposalEntity, outbox_event_entity_1.OutboxEventEntity],
    synchronize: true,
    logging: false,
});
