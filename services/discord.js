import {Client, EmbedBuilder, Events, GatewayIntentBits} from "discord.js";
import {setupJobs} from "../jobs/index.js";

export const discord = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,]});

export async function setupDiscord(discordBotToken) {
    discord.on(Events.ClientReady, () => {
        console.log(`Logged in as ${discord.user.tag}!`);

        setupJobs();
    });

    discord.on(Events.MessageCreate, async message => {

    });

    await discord.login(discordBotToken);
}

export async function sendMessage(channelId, message) {
    try {
        const channel = await discord.channels.fetch(channelId);
        await channel.send(message);
    } catch (error) {
        console.log('sendMessage error', error);
    }
}

export async function sendProposalToDiscord(proposal, chain) {
    const cliMessage = `\`\`\`${chain.binaryName} tx gov vote ${proposal.id} [yes/no/no_with_veto/abstain] --chain-id ${chain.chainId} --from '[your_key_name]\`\`\``;

    const fields = [];
    if (proposal.type?.includes('SoftwareUpgradeProposal')) {
        fields.push({
            name: 'Version',
            value: proposal.plan?.name,
            inline: true
        });
        fields.push({
            name: 'Target Height',
            value: proposal.plan?.height,
            inline: true
        });

        if (proposal.plan?.info) {
            const infoJson = JSON.parse(proposal.plan?.info);
            if (infoJson?.binaries) {
                let text = '';
                for (const key of Object.keys(infoJson.binaries)) {
                    text += `${key}: ${infoJson.binaries[key]}\n`;
                }
                fields.push({
                    name: 'Binaries',
                    value: text,
                });
            }
        }
    }

    const url = chain.proposalUrl?.replace('{id}', proposal.id);

    let description = proposal.description?.replace(/`/g, '\\`') ?? "";
    if (description.length > 200) {
        description = description.substring(0, 200) + ' ...';
    }

    description += '\n\n' + url;

    const embed = new EmbedBuilder()
        .setTitle(proposal.title)
        .setDescription(description)
        .setURL(url)
        //.setColor(0xFF0000)
        .setThumbnail(chain.logoUrl)
        .setAuthor({name: `${chain.name} Governance`, iconURL: chain.logoUrl})
        .addFields(
            {name: 'Proposal ID', value: proposal.id.toString()},
            ...fields,
            {name: 'Submit Time', value: proposal.submitTime.toUTCString()},
            {
                name: 'Voting Time',
                value: `${proposal.votingStartTime.toUTCString()} - ${proposal.votingEndTime.toUTCString()}`
            },
            {name: 'How to vote via CLI?', value: cliMessage},
        );

    await sendMessage(chain.dcChannelId, {embeds: [embed]});
}
