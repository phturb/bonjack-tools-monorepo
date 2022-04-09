import { PrismaClient } from "@prisma/client";
import {
  CacheType,
  Interaction,
  MessageActionRow,
  MessageButton,
  VoiceChannel,
  VoiceState,
  Message,
} from "discord.js";
import { Server as HttpServer } from "http";
import { Server as WebSocketServer, WebSocket } from "ws";
import { CHANNEL_ID, TIMER_TIME } from "./config/config";
import DiscordManager from "./discordManager";
import { getPlayerStats } from "./helpers/stats.helpers";
import { broadcast, send } from "./helpers/ws.helpers";
import { emptyPlayer, GameState } from "./interfaces/gameState.interface";
import { Message as Msg } from "./interfaces/message.interface";

class GameManager {
  roles: string[];
  gameState: GameState;
  discordManager: DiscordManager;
  httpServer: HttpServer;
  webSocketServer: WebSocketServer;
  prisma: PrismaClient;
  countDownId: NodeJS.Timer | undefined;
  discordGameMessage: Message<boolean> | undefined;

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
        emptyPlayer(),
        emptyPlayer(),
        emptyPlayer(),
        emptyPlayer(),
        emptyPlayer(),
      ],
      rollCount: 0,
      gameInProgress: false,
      availablePlayers: { "": undefined },
      gameId: 0,
      nextRollTimer: 0,
      canRoll: true,
    };
    this.roles = ["ADC", "MID", "JUNGLE", "SUPPORT", "TOP"];
    this.countDownId = undefined;
    this.discordGameMessage = undefined;
  }

  async init() {
    this.registerWebSocket();
    this.registerDiscord();
    await this.updatePlayerListFromDiscord();
  }

  private registerWebSocket() {
    this.webSocketServer.on("connection", (ws: WebSocket) => {
      ws.on("message", async (message: string) => {
        const parsedMessage: Msg = JSON.parse(message);
        if (parsedMessage.action === "updatePlayers") {
          await this.updatePlayers(ws, parsedMessage);
        }
        if (parsedMessage.action === "roll") {
          await this.roll();
        }

        if (parsedMessage.action === "cancel") {
          await this.cancel();
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
      ws.on("error", function (err: Error) {
        console.warn(err);
      });
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
    this.discordManager.discordClient.on(
      "interactionCreate",
      async (interaction: Interaction<CacheType>) => {
        if (
          interaction.isButton() &&
          this.discordGameMessage?.id === interaction.message.id
        ) {
          if (interaction.customId === "roll_btn") {
            await this.roll();
            await this.updateGameMessage();
          } else if (interaction.customId === "finish_btn") {
            await this.reset();
            await this.updateGameMessage();
          } else if (interaction.customId === "cancel_btn") {
            await this.cancel();
            await this.updateGameMessage();
          }
          await interaction.deferUpdate();
          return;
        }
        if (interaction.isButton()) {
          await interaction.deferUpdate();
          return;
        }

        if (!interaction.isCommand()) {
          return;
        }
        const commandName = interaction.commandName;

        if (commandName !== "ldn") {
          return;
        }

        const { embedMessage, components } = this.createMessageElements();
        this.discordGameMessage = (await interaction.reply({
          content: embedMessage,
          components: [components],
          fetchReply: true,
        })) as Message<boolean>;
      }
    );
  }

  private createMessageEmbed(): string {
    let description;
    if (this.gameState.gameInProgress) {
      description = `Loi in progress, roll number : ${this.gameState.rollCount}`;
    } else {
      description =
        "Waiting for players ...\nGo see the web dashboard at https://tools.bonjack.club/lois-des-norms";
    }
    let customMessage = description;
    customMessage += "\n";
    this.gameState.players.forEach((gamePlayer, index) => {
      customMessage += "> ";
      customMessage += gamePlayer.role
        ? `*${gamePlayer.role}*`
        : `*Player ${index + 1}*`;
      customMessage += "\t";
      customMessage += gamePlayer.player.name ?? "Empty Spot";
      customMessage += "\n";
    });
    return customMessage;
  }

  private createMessageElements(): {
    embedMessage: string;
    components: MessageActionRow;
  } {
    const embedMessage = this.createMessageEmbed();
    const buttons = [
      new MessageButton()
        .setCustomId("roll_btn")
        .setLabel("Roll")
        .setStyle("PRIMARY")
        .setDisabled(!this.gameState.canRoll),
      new MessageButton()
        .setCustomId("finish_btn")
        .setLabel("Finish")
        .setStyle("SUCCESS")
        .setDisabled(!this.gameState.gameInProgress),
      new MessageButton()
        .setCustomId("cancel_btn")
        .setLabel("Cancel")
        .setStyle("DANGER"),
    ];
    const components = new MessageActionRow().addComponents(buttons);
    return { embedMessage, components };
  }

  private async updateGameMessage() {
    if (this.discordGameMessage) {
      const { embedMessage, components } = this.createMessageElements();
      this.discordGameMessage = (await this.discordGameMessage?.edit({
        content: embedMessage,
        components: [components],
      })) as any;
      console.log(this.discordGameMessage);
    }
  }

  private clearMessage() {
    this.discordGameMessage = undefined;
  }

  private async refreshDiscord() {
    console.log("Refresh Discord information");
    await this.updatePlayerListFromDiscord();
  }

  private async resetMessage(type: "reset" | "cancel") {
    const typeText = type === "reset" ? "Finished" : "Canceled";
    const description = `Loi is ${typeText} !`;
    let customMessage = "**Lois Des Norms**\n";
    customMessage += description;
    customMessage += "\n";
    this.gameState.players.forEach((gamePlayer, index) => {
      customMessage += "> ";
      customMessage += gamePlayer.role
        ? `*${gamePlayer.role}*`
        : `*Player ${index + 1}*`;
      customMessage += "\t";
      customMessage += gamePlayer.player.name ?? "Empty Spot";
      customMessage += "\n";
    });
    if (this.discordGameMessage) {
      this.discordGameMessage = (await this.discordGameMessage?.edit(
        customMessage
      )) as any;
    }
  }

  private async reset() {
    console.log("Reset game!");
    this.gameState.gameInProgress = false;
    this.gameState.rollCount = 0;
    for (let i = 0; i < this.gameState.players.length; i++) {
      this.gameState.players[i].role = undefined;
    }
    if (this.countDownId) {
      clearInterval(this.countDownId);
    }
    this.countDownId = undefined;
    this.gameState.nextRollTimer = 0;
    this.gameState.canRoll = true;
    // TODO : Update discord message with finish or reset
    await this.resetMessage("reset");
    this.clearMessage();
    this.updatePlayerListFromDiscord();

    broadcast(this.webSocketServer, {
      action: "updateState",
      content: JSON.stringify(this.gameState),
    });
  }

  private async cancel() {
    console.warn("Game canceled!");
    if (this.gameState.gameInProgress && this.gameState.rollCount > 0) {
      await this.prisma.roll.deleteMany({
        where: {
          gameId: this.gameState.gameId,
        },
      });
      await this.prisma.game.delete({
        where: {
          id: this.gameState.gameId,
        },
      });
      this.gameState.gameId -= 1;
    }
    this.gameState.gameInProgress = false;
    this.gameState.rollCount = 0;
    for (let i = 0; i < this.gameState.players.length; i++) {
      this.gameState.players[i].role = undefined;
    }
    if (this.countDownId) {
      clearInterval(this.countDownId);
    }
    this.countDownId = undefined;
    this.gameState.nextRollTimer = 0;
    this.gameState.canRoll = true;
    await this.resetMessage("cancel");
    this.clearMessage();
    this.updatePlayerListFromDiscord();
    broadcast(this.webSocketServer, {
      action: "updateState",
      content: JSON.stringify(this.gameState),
    });
  }

  private async updatePlayers(ws: WebSocket, parsedMessage: Msg) {
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
    if (!this.gameState.canRoll) {
      return;
    }
    this.gameState.canRoll = false;
    this.gameState.nextRollTimer = TIMER_TIME;
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

    this.countDownId = setInterval(async () => {
      this.gameState.nextRollTimer -= 1000;
      if (this.gameState.canRoll || this.gameState.nextRollTimer <= 0) {
        if (this.countDownId) {
          clearInterval(this.countDownId);
        }
        this.countDownId = undefined;
        this.gameState.nextRollTimer = 0;
        this.gameState.canRoll = true;
        await this.updateGameMessage();
        broadcast(this.webSocketServer, {
          action: "updateState",
          content: JSON.stringify(this.gameState),
        });
      }
    }, 1000);
    await this.updateGameMessage();
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
    await this.updateGameMessage();
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
        players[i] = emptyPlayer();
      }
    }
    return players;
  }
}

export default GameManager;
