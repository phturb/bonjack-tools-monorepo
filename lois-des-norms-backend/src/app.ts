import express, { Application } from "express";
import {
  AnyChannel,
  Client as DiscordClient,
  Intents,
  VoiceChannel,
  VoiceState,
} from "discord.js";
import http from "http";
import { WebSocket, Server as WebSocketServer } from "ws";
import { Message } from "./interfaces/message.interface";
import GameManager from "./gameManager";
import { broadcast, send } from "./helpers/ws.helpers";
import { CHANNEL_ID, DISCORD_TOKEN, PORT } from "./config/config";
import DiscordManager from "./discordManager";
import { PrismaClient } from "@prisma/client";
import configureExpressApplication from "./controllers/controllers";
import { getPlayerStats } from "./helpers/stats.helpers";

if (!DISCORD_TOKEN) {
  console.error("Discord Token not defined ! Please defined DISCORD_TOKEN");
  process.exit(1);
}

const prisma = new PrismaClient();
const discordClient = new DiscordClient({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
});
const app: Application = express();
configureExpressApplication(app, prisma);
const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });
const discordManager = new DiscordManager(discordClient);
const gameManager = new GameManager(discordManager, server, wsServer, prisma);
const init = async () => {
    await discordManager.init();
    await gameManager.init();

}

init().then(() => {
    server.listen(PORT, function () {
        console.log(`Server is running on port ${PORT}`);
      });
    server.on("close", () => {
      discordManager.close();
    })
});