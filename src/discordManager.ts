
import { Client as DiscordClient } from "discord.js";
import { DISCORD_TOKEN } from "./config/config";

class DiscordManager {

    discordClient: DiscordClient;

    constructor(discordClient: DiscordClient) {
        this.discordClient = discordClient;
    }

    async init() {
        this.discordClient.on('ready', () => {
            console.log(`Discord Bot logged in as ${this.discordClient.user?.tag}!`);
        });
        
        await this.discordClient.login(DISCORD_TOKEN!);        
    }
    
}

export default DiscordManager;