import { GameState } from "./interfaces/gameState.interface";
import { Server as HttpServer } from "http";
import { WebSocket, Server as WebSocketServer } from "ws";
import DiscordManager from "./discordManager";
import { getPlayerStats } from "./helpers/stats.helpers";
import { PrismaClient } from "@prisma/client";
import { VoiceChannel, VoiceState } from "discord.js";
import { broadcast, send } from "./helpers/ws.helpers";
import { CHANNEL_ID } from "./config/config";
import { Message } from "./interfaces/message.interface";

class GameManager {
  roles: string[];
  gameState: GameState;
  discordManager: DiscordManager;
  httpServer: HttpServer;
  webSocketServer: WebSocketServer;
  prisma: PrismaClient;

  constructor(
    discordManager: DiscordManager,
    httpServer: HttpServer,
    webSocketServer: WebSocketServer,
    prisma: PrismaClient
  ) {
    this.prisma = prisma;
    this.discordManager = discordManager;
    this.httpServer = httpServer;
    this.webSocketServer = webSocketServer;
    this.gameState = {
      players: [
        { player: { id: "", name: undefined }, role: undefined },
        { player: { id: "", name: undefined }, role: undefined },
        { player: { id: "", name: undefined }, role: undefined },
        { player: { id: "", name: undefined }, role: undefined },
        { player: { id: "", name: undefined }, role: undefined },
      ],
      rollCount: 0,
      gameInProgress: false,
      availablePlayers: { "": undefined },
      gameId: 0,
    };
    this.roles = ["ADC", "MID", "JUNGLE", "SUPPORT", "TOP"];
  }

  async init() {
    this.registerWebSocket();
    this.registerDiscord();
    await this.updatePlayerListFromDiscord();
  }

  private registerWebSocket() {
    this.webSocketServer.on("connection", (ws: WebSocket) => {
        ws.on("message", async (message: string) => {
          const parsedMessage: Message = JSON.parse(message);
          if (parsedMessage.action === "updatePlayers") {
            await this.updatePlayers(ws, parsedMessage);
          }
          if (parsedMessage.action === "roll") {
            await this.roll();
          }
          if (parsedMessage.action === "reset") {
            await this.reset();
          }
  
          if (parsedMessage.action === "refreshDiscord") {
              this.refreshDiscord();
          }
        });
        send(
          { action: "updateState", content: JSON.stringify(this.gameState) },
          ws
        );
      });
  }

  private registerDiscord() {
    this.discordManager.discordClient.on(
        "voiceStateUpdate",
        async (oldState: VoiceState, newState: VoiceState) => {
          if (
            oldState.channelId === CHANNEL_ID ||
            newState.channelId === CHANNEL_ID
          ) {
            await this.updatePlayerListFromDiscord();
          }
        }
      );
  }

  private async refreshDiscord() {
    console.log("Refresh Discord information");
    await this.updatePlayerListFromDiscord();
  }

  private async reset() {
    console.log("Reset game!");
    this.gameState.gameInProgress = false;
    this.gameState.rollCount = 0;
    for (let i = 0; i < this.gameState.players.length; i++) {
      this.gameState.players[i].role = undefined;
    }
    this.updatePlayerListFromDiscord();
    broadcast(this.webSocketServer, {
      action: "updateState",
      content: JSON.stringify(this.gameState),
    });
  }

  private async updatePlayers(ws: WebSocket, parsedMessage: Message) {
    const content: { id: string; name: string | undefined }[] = JSON.parse(
      parsedMessage.content
    );
    const processedPlayers = content.map((x) => {
      return { player: x, role: undefined };
    });
    if (this.gameState.gameInProgress) {
      send(
        {
          action: "updateState",
          content: JSON.stringify(this.gameState),
        },
        ws
      );
    } else {
      this.verifyAndAdjustPlayers(
        processedPlayers,
        this.gameState.availablePlayers
      );
      this.gameState.players = processedPlayers;
      broadcast(this.webSocketServer, {
        action: "updateState",
        content: JSON.stringify(this.gameState),
      });
    }
  }

  private async roll() {
    if (!this.gameState.gameInProgress) {
      this.gameState.gameInProgress = true;
      const currentGame = await this.prisma.game.create({
        data: {
          player_game_player1IdToplayer: this.gameState.players[0].player.id
            ? {
                connect: { id: this.gameState.players[0].player.id },
              }
            : undefined,
          player_game_player2IdToplayer: this.gameState.players[1].player.id
            ? {
                connect: { id: this.gameState.players[1].player.id },
              }
            : undefined,
          player_game_player3IdToplayer: this.gameState.players[2].player.id
            ? {
                connect: { id: this.gameState.players[2].player.id },
              }
            : undefined,
          player_game_player4IdToplayer: this.gameState.players[3].player.id
            ? {
                connect: { id: this.gameState.players[3].player.id },
              }
            : undefined,
          player_game_player5IdToplayer: this.gameState.players[4].player.id
            ? {
                connect: { id: this.gameState.players[4].player.id },
              }
            : undefined,
        },
      });
      this.gameState.gameId = currentGame.id;
      console.log("Law has started!");
    }
    this.gameState.rollCount += 1;
    console.log(`Randomize Roles for the ${this.gameState.rollCount} time!`);
    this.randomizeRoles();
    for (let i = 0; i < this.gameState.players.length; i++) {
      this.gameState.players[i].role = this.roles[i];
    }
    await this.prisma.roll.create({
      data: {
        gameId: this.gameState.gameId,
        rollNumber: this.gameState.rollCount,
        player1Roll: this.gameState.players[0].role ?? null,
        player2Roll: this.gameState.players[1].role ?? null,
        player3Roll: this.gameState.players[2].role ?? null,
        player4Roll: this.gameState.players[3].role ?? null,
        player5Roll: this.gameState.players[4].role ?? null,
      },
    });
    broadcast(this.webSocketServer, {
      action: "updateState",
      content: JSON.stringify(this.gameState),
    });
  }

  private randomizeRoles() {
    for (let i = this.roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.roles[i];
      this.roles[i] = this.roles[j];
      this.roles[j] = temp;
    }
  }

  private async updatePlayerListFromDiscord() {
    const ch: VoiceChannel | null = await this.discordManager.getChannel();
    if (!ch) return;
    let newAvailablePlayers: any = { "": undefined };
    for (const [id, m] of ch.members) {
      if (m.nickname) {
        newAvailablePlayers[id] = {
          name: m.nickname,
          stats: await getPlayerStats(id, this.prisma),
        };
      } else if (m.displayName) {
        newAvailablePlayers[id] = {
          name: m.displayName,
          stats: await getPlayerStats(id, this.prisma),
        };
      }
      await this.prisma.player.upsert({
        where: {
          id: id,
        },
        update: {
          name: newAvailablePlayers[id].name,
        },
        create: {
          id: id,
          name: newAvailablePlayers[id].name,
        },
      });
    }
    console.log("Available Player list updated : ", newAvailablePlayers);
    if (!this.gameState.gameInProgress) {
      const newPlayers = [...this.gameState.players];
      this.verifyAndAdjustPlayers(newPlayers, newAvailablePlayers);
      this.gameState.availablePlayers = newAvailablePlayers;
      for (const ap of Object.entries(newAvailablePlayers)) {
        if (newPlayers.filter((p) => p.player.id === ap[0]).length <= 0) {
          for (let i = 0; i < newPlayers.length; i++) {
            if (newPlayers[i].player.id === "" || !newPlayers[i].player.id) {
              newPlayers[i].player.id = ap[0];
              newPlayers[i].player.name = (ap[1] as any).name as string;
              break;
            }
          }
        }
      }
      this.gameState.players = newPlayers;
      broadcast(this.webSocketServer, {
        action: "updateState",
        content: JSON.stringify(this.gameState),
      });
    }
  }

  private verifyAndAdjustPlayers(
    players: {
      player: { id: string; name: string | undefined };
      role: string | undefined;
    }[],
    availablePlayers: any
  ) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].player.id === "" || !players[i].player.id) continue;
      for (let j = 0; j < players.length; j++) {
        if (i === j) continue;
        if (players[i].player.id === players[j].player.id) {
          players[j].player = { id: "", name: undefined };
        }
      }
    }
    for (let i = 0; i < players.length; i++) {
      if (!availablePlayers[players[i].player.id as string]) {
        players[i] = { player: { id: "", name: undefined }, role: undefined };
      }
    }
    return players;
  }
}

export default GameManager;
