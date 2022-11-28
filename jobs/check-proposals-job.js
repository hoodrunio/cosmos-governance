import {CronJob} from "cron";
import {Settings} from "../config/settings.js";
import LcdClient from "../lib/lcd.js";
import database from "../services/database.js";
import {sendProposalToDiscord} from "../services/discord.js";

const NewProposalMiliseconds = 1000 * 60 * 60 * 24 * 7;

export default function checkProposalsJob() {
    let isRunning = false;
    const cronJob = new CronJob('0 */5 * * * *', async () => {
        if (isRunning) {
            console.log('checkProposalsJob is already running.');
            return;
        }

        isRunning = true;
        try {
            console.log('checkProposalsJob started.');

            const chains = Settings['chains'];
            await Promise.all(chains.map(chain => processProposals(chain)));

            console.log('checkProposalsJob finished.');
        } catch (error) {
            console.log('checkProposalsJob got error', error);
        } finally {
            isRunning = false;
        }
    });
    cronJob.start();
}

async function processProposals(chain) {
    try {
        const lcdClient = new LcdClient(chain.lcd);
        const proposals = await lcdClient.getProposals();
        for (const proposal of proposals) {
            const existProposal = await database.getExistsProposal(proposal.id, chain.name);
            if (existProposal) {
                continue;
            }

            // check proposal is new
            if (proposal.submitTime.getTime() < Date.now() - NewProposalMiliseconds) {
                console.log(`Proposal ${proposal.id} is too old.`);
                continue;
            }

            await sendProposalToDiscord(proposal, chain);
            await database.createProposal(proposal.id, chain.name);
        }
    } catch (error) {
        console.log(`[${chain.name}] processProposals error`, error);
    }

}