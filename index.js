import {DiscordToken} from "./config/env.js";
import {setupDiscord} from "./services/discord.js";

if (!DiscordToken) {
    console.error('DISCORD_TOKEN is not set');
    process.exit(1);
}

console.log('Starting...');

console.log('Setup discord...');
await setupDiscord(DiscordToken);