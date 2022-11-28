import {PrismaClient} from "@prisma/client";

export const prisma = new PrismaClient();

export default {
    async getExistsProposal(proposalId, chain) {
        return await prisma.proposal.findFirst({
            where: {
                chain: chain,
                proposalId: proposalId,
            }
        });
    },
    async createProposal(proposalId, chain) {
        await prisma.proposal.create({
            data: {
                proposalId: proposalId,
                chain: chain,
            }
        });
    },
}