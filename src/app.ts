import express, { Application, Request, Response } from 'express';
import { AnyChannel, Client as DiscordClient, Intents, VoiceChannel, VoiceState} from 'discord.js';
import cors from 'cors';
import http from 'http';
import { WebSocket, Server as WebSocketServer } from 'ws';
import { Message } from './interfaces/message.interface';
import { GameState } from './interfaces/gameState.interface';
import GameManager from './gameManager';
import { broadcast, send } from './helpers/ws.helpers';
import { CHANNEL_ID, DISCORD_TOKEN, PORT } from './config/config';
import DiscordManager from './discordManager';
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

if (!DISCORD_TOKEN) {
    console.error("Discord Token not defined ! Please defined DISCORD_TOKEN");
    process.exit(1);
}

const app: Application = express();
app.use(cors());

app.get("/players", async (req: Request, res: Response) => {
    const players = await prisma.player.findMany();
    res.json(players);
});

app.get("/games", async (req: Request, res: Response) => {
    const games = await prisma.game.findMany();
    res.json(games);
});


app.get("/rolls", async (req: Request, res: Response) => {
    const rolls = await prisma.roll.findMany();
    res.json(rolls);
});



const server = http.createServer(app);
const wsServer = new WebSocketServer({server});
const discordClient = new DiscordClient({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES ]});

discordClient.on('ready', () => {
    console.log(`Discord Bot logged in as ${discordClient.user?.tag}!`);
});

discordClient.login(DISCORD_TOKEN!);

let gameState: GameState = {
    players: [
        { player: {id: '', name: undefined}, role: undefined},
        { player: {id: '', name: undefined}, role: undefined},
        { player: {id: '', name: undefined}, role: undefined},
        { player: {id: '', name: undefined}, role: undefined},
        { player: {id: '', name: undefined}, role: undefined}
    ],
    rollCount: 0,
    gameInProgress: false,
    availablePlayers: {'' : undefined},
    gameId: 0
}

const discordManager = new DiscordManager(discordClient);
const gameManager = new GameManager(discordManager, server, wsServer);

const getPlayerStats = async (id: string) => {
    const playerGames = await prisma.game.findMany({
        where : {OR : [{
                player1Id : {
                    equals: id
                }
            },
            {
                player2Id : {
                    equals: id
                }
            },
            {
                player3Id : {
                    equals: id
                }
            },
            {
                player4Id : {
                    equals: id
                }
            },
            {
                player5Id : {
                    equals: id
                }
            }],
        },
        include: {
            roll: true
        }
    });
    const gamesLength = playerGames.map(x => x.roll.length);
    return { numberOfGame: gamesLength.length,
             totalRoll: gamesLength.reduce((x, y,) => x + y, 0)
            };
}

const verifyAndAdjustPlayers =(players: {player: {id: string, name : string | undefined}, role: string | undefined}[], availablePlayers: any) => {
    for(let i = 0; i < players.length; i++) {
        if (players[i].player.id === '' || !players[i].player.id ) continue;
        for(let j = 0; j < players.length; j++) {
            if (i === j) continue;
            if (players[i].player.id === players[j].player.id) {
                players[j].player = { id: '', name: undefined};
            }
        }
    }
    for(let i = 0; i < players.length; i++) {
        if ( !availablePlayers[players[i].player.id as string] ) {
            players[i] = { player: {id: '', name: undefined}, role: undefined};
        }
    }
    return players;
}

const updatePlayerListFromDiscord = () => {
    discordClient.channels.fetch(CHANNEL_ID).then(async (ch: AnyChannel | null) => {
        if (!ch) return;
        let newAvailablePlayers: any = {'' : undefined};
        for(const [id, m] of (ch as VoiceChannel).members) {
            if(m.nickname) {
                newAvailablePlayers[id] = { name: m.nickname, stats: await getPlayerStats(id)};
            } else if (m.displayName) {
                newAvailablePlayers[id] = { name: m.displayName, stats: await getPlayerStats(id)};
            }
            const dbPlayer = await prisma.player.findFirst({where: {
                id: id
            }});
            if(!dbPlayer){
                await prisma.player.create(
                    {data: {
                        id: id,
                        name: newAvailablePlayers[id].name
                    }}
                );
            }
        }
        console.log("Available Player list updated : ", newAvailablePlayers);
        if (!gameState.gameInProgress) {
            const newPlayers = [...gameState.players];
            verifyAndAdjustPlayers(newPlayers, newAvailablePlayers);
            gameState.availablePlayers = newAvailablePlayers;
            for(const ap of Object.entries(newAvailablePlayers)) {
                if (newPlayers.filter((p) => p.player.id === ap[0]).length <= 0) {
                    for(let i = 0; i < newPlayers.length; i++) {
                        if (newPlayers[i].player.id === '' || !newPlayers[i].player.id) {
                            newPlayers[i].player.id = ap[0];
                            newPlayers[i].player.name = (ap[1] as any).name as string;
                            break;
                        }
                    }
                }
            }
            gameState.players = newPlayers;
            broadcast(wsServer, { action: 'updateState', content: JSON.stringify(gameState) });
        }
    });
}

wsServer.on('connection', (ws: WebSocket) => {
    ws.on('message', async (message: string) => {
        const parsedMessage: Message = JSON.parse(message);
        if(parsedMessage.action === 'updatePlayers') {
            const content: { id: string, name: string | undefined}[] = JSON.parse(parsedMessage.content);
            const processedPlayers = content.map(x => { return { player: x, role: undefined };});
            if ( gameState.gameInProgress ) {
                send({ action: 'updateState', content: JSON.stringify(gameState) }, ws);
            } else {
                verifyAndAdjustPlayers(processedPlayers, gameState.availablePlayers);
                gameState.players = processedPlayers;
                broadcast(wsServer, { action: 'updateState', content: JSON.stringify(gameState) });
            }
        }
        if ( parsedMessage.action === 'roll' ) {
            if (!gameState.gameInProgress) {
                gameState.gameInProgress = true;
                const currentGame = await prisma.game.create({
                    data: {
                        player_game_player1IdToplayer: gameState.players[0].player.id ? {
                            connect: { id: gameState.players[0].player.id }
                        } : undefined,
                        player_game_player2IdToplayer: gameState.players[1].player.id ? {
                            connect: { id: gameState.players[1].player.id }
                        } : undefined,
                        player_game_player3IdToplayer: gameState.players[2].player.id ? {
                            connect: { id: gameState.players[2].player.id }
                        } : undefined,
                        player_game_player4IdToplayer: gameState.players[3].player.id ? {
                            connect: { id: gameState.players[3].player.id }
                        } : undefined,
                        player_game_player5IdToplayer: gameState.players[4].player.id ? {
                            connect: { id: gameState.players[4].player.id }
                        } : undefined,
                    }
                });
                gameState.gameId = currentGame.id;
                console.log("Law has started!");
            }
            gameState.rollCount += 1;
            console.log(`Randomize Roles for the ${gameState.rollCount} time!`);
            gameManager.randomizeRoles();
            for(let i = 0; i < gameState.players.length; i++) {
                gameState.players[i].role = gameManager.roles[i];
            }
            await prisma.roll.create({
                data: {
                    gameId: gameState.gameId,
                    rollNumber: gameState.rollCount,
                    player1Roll: gameState.players[0].role ?? null,
                    player2Roll: gameState.players[1].role ?? null,
                    player3Roll: gameState.players[2].role ?? null,
                    player4Roll: gameState.players[3].role ?? null,
                    player5Roll: gameState.players[4].role ?? null,
                }
            })
            broadcast(wsServer, { action: 'updateState', content: JSON.stringify(gameState) });
        }
        if ( parsedMessage.action === 'reset' ) {
            console.log("Reset game!")
            gameState.gameInProgress = false;
            gameState.rollCount = 0;
            for(let i = 0; i < gameState.players.length; i++) {
                gameState.players[i].role = undefined;
            }
            updatePlayerListFromDiscord();
            broadcast(wsServer, { action: 'updateState', content: JSON.stringify(gameState) });
        }

        if ( parsedMessage.action === 'refreshDiscord' ) {
            console.log('Refresh Discord information');
            updatePlayerListFromDiscord();
        }

    });
    send({ action: 'updateState', content: JSON.stringify(gameState) }, ws);
});

discordClient.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    if(oldState.channelId === CHANNEL_ID || newState.channelId === CHANNEL_ID) {
        updatePlayerListFromDiscord();
    }
});

discordClient.login(DISCORD_TOKEN!).then(() => {
    updatePlayerListFromDiscord();
})

server.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});