import { AnyChannel, Client as DiscordClient, VoiceChannel } from "discord.js";
import { CHANNEL_ID, DISCORD_TOKEN } from "./config/config";

class DiscordManager {
  discordClient: DiscordClient;

  constructor(discordClient: DiscordClient) {
    this.discordClient = discordClient;
  }

  async init() {
    this.discordClient.on("ready", () => {
      console.log(`Discord Bot logged in as ${this.discordClient.user?.tag}!`);
    });

    await this.discordClient.login(DISCORD_TOKEN!);
  }

  async getChannel(): Promise<VoiceChannel | null> {
      try {
    return await this.discordClient.channels.fetch(
      CHANNEL_ID
    ) as VoiceChannel;
    } catch (e : any) {
        console.warn(e);
        return null;
    }
  }

  close() {
    this.discordClient.destroy();
  }
}

export default DiscordManager;
