import {Client as DiscordClient, VoiceChannel} from "discord.js";
import {CHANNEL_ID, DISCORD_TOKEN} from "./config/config";

class DiscordManager {
  discordClient: DiscordClient;
  private channel: VoiceChannel | null = null;
  private channelFetchState: "error" | "success" | "inProgress" = "inProgress";

  constructor(discordClient: DiscordClient) {
    this.discordClient = discordClient;
  }

  async init() {
    this.discordClient.on("ready", () => {
      console.log(`Discord Bot logged in as ${this.discordClient.user?.tag}!`);
      this.discordClient.channels.fetch(CHANNEL_ID).then((ch) => {
          console.log("Successfully fetched the channel");
          if(ch) {
            this.channel = ch as VoiceChannel;
              this.channelFetchState = "success";
          } else {
              this.channel = null;
              this.channelFetchState = "error";
          }
      }).catch((_) => {
          this.channel = null;
          this.channelFetchState = "error";
      });
    });
    await this.discordClient.login(DISCORD_TOKEN!);
  }

  async getChannel(): Promise<VoiceChannel | null> {
    if(this.channelFetchState === 'success') {
        return this.channel;
    } else if (this.channelFetchState === 'inProgress') {
        return null;
    } else {
        try {
            return await this.discordClient.channels.fetch("CHANNEL_ID") as VoiceChannel;
        } catch (e: any) {
            console.error(e);
            return null;
        }
    }
  }

  close() {
    this.discordClient.destroy();
  }
}

export default DiscordManager;
