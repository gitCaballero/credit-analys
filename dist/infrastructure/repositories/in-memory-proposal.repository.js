"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryProposalRepository = void 0;
class InMemoryProposalRepository {
    constructor() {
        this.store = new Map();
    }
    async save(proposal) {
        this.store.set(proposal.proposalId, proposal);
    }
    async findById(proposalId) {
        return this.store.get(proposalId) ?? null;
    }
    async findAll() {
        return Array.from(this.store.values());
    }
}
exports.InMemoryProposalRepository = InMemoryProposalRepository;
