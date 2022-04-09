import express, { Application } from "express";
import {
  Client as DiscordClient,
  Intents,
} from "discord.js";
import http from "http";
import { Server as WebSocketServer } from "ws";
import GameManager from "./gameManager";
import { DISCORD_TOKEN, PORT } from "./config/config";
import DiscordManager from "./discordManager";
import { PrismaClient } from "@prisma/client";
import configureExpressApplication from "./controllers/controllers";

if (!DISCORD_TOKEN) {
  console.error("Discord Token not defined ! Please defined DISCORD_TOKEN");
  process.exit(1);
}

const prisma = new PrismaClient();
const discordClient = new DiscordClient({
  intents: [Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGES],
});
const app: Application = express();
configureExpressApplication(app, prisma);
const server = http.createServer(app);
const wsServer = new WebSocketServer({ server: server });
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
