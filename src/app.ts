import express, { Application, Request, Response } from 'express';
import { AnyChannel, Client as DiscordClient, Intents, VoiceChannel, VoiceState} from 'discord.js';
import cors from 'cors';
import http from 'http';
import { WebSocket, Server as WebSocketServer } from 'ws';
import { Message } from './interfaces/message.interface';
import 'dotenv/config';


const PORT: number | string =  process.env.PORT || 3001;
const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;
const CHANNEL_ID: string = process.env.CHANNEL_ID || '212369829582077953';

if (!DISCORD_TOKEN) {
    console.error("Discord Token not defined ! Please defined DISCORD_TOKEN");
    process.exit(1);
}

const app: Application = express();
app.use(cors());
const server = http.createServer(app);

const wsServer = new WebSocketServer({server});

// DISCORD
const discordClient = new DiscordClient({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES ]});

discordClient.on('ready', () => {
    console.log(`Discord Bot logged in as ${discordClient.user?.tag}!`);
});

discordClient.login(DISCORD_TOKEN!);

const broadcast = (content: any, sender?: WebSocket | undefined) => {
    wsServer.clients.forEach(client => {
        if ( sender || sender === client ) return;
        client.send(JSON.stringify(content));
    })
} 

const send = (content: any, receiver: WebSocket) => {
    receiver.send(JSON.stringify(content));
}

const shuffleArray = (array: string[]) => {
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = roles[i];
      array[i] = array[j];
      array[j] = temp;
    }
};

let roles = ['ADC', 'MID', 'JUNGLE', 'SUPPORT', 'TOP'];

let gameState: {
    players: { player: { id: string, name: string | undefined}, role: string | undefined}[],
    rollCount: number,
    gameInProgress: boolean,
    availablePlayers: any,
} = {
    players: [
        { player: {id: '', name: undefined}, role: undefined},
        { player: {id: '', name: undefined}, role: undefined},
        { player: {id: '', name: undefined}, role: undefined},
        { player: {id: '', name: undefined}, role: undefined},
        { player: {id: '', name: undefined}, role: undefined}
    ],
    rollCount: 0,
    gameInProgress: false,
    availablePlayers: {'' : undefined}
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
    discordClient.channels.fetch(CHANNEL_ID).then((ch: AnyChannel | null) => {
        if (!ch) return;
        let newAvailablePlayers: any = {'' : undefined};
        for(const [id, m] of (ch as VoiceChannel).members) {
            if(m.nickname) {
                newAvailablePlayers[id] = m.nickname;
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
                            newPlayers[i].player.name = ap[1] as string;
                            break;
                        }
                    }
                }
            }
            gameState.players = newPlayers;
            broadcast({ action: 'updateState', content: JSON.stringify(gameState) });
        }
    });
}

wsServer.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        const parsedMessage: Message = JSON.parse(message);
        if(parsedMessage.action === 'updatePlayers') {
            const content: { id: string, name: string | undefined}[] = JSON.parse(parsedMessage.content);
            const processedPlayers = content.map(x => { return { player: x, role: undefined };});
            if ( gameState.gameInProgress ) {
                send({ action: 'updateState', content: JSON.stringify(gameState) }, ws);
            } else {
                verifyAndAdjustPlayers(processedPlayers, gameState.availablePlayers);
                gameState.players = processedPlayers;
                broadcast({ action: 'updateState', content: JSON.stringify(gameState) });
            }
        }
        if ( parsedMessage.action === 'roll' ) {
            if (!gameState.gameInProgress) {
                gameState.gameInProgress = true;
                console.log("Law has started!");
            }
            gameState.rollCount += 1;
            console.log(`Randomize Roles for the ${gameState.rollCount} time!`);
            shuffleArray(roles);
            for(let i = 0; i < gameState.players.length; i++) {
                gameState.players[i].role = roles[i];
            }
            broadcast({ action: 'updateState', content: JSON.stringify(gameState) });
        }
        if ( parsedMessage.action === 'reset' ) {
            console.log("Reset game!")
            gameState.gameInProgress = false;
            gameState.rollCount = 0;
            for(let i = 0; i < gameState.players.length; i++) {
                gameState.players[i].role = undefined;
            }
            updatePlayerListFromDiscord();
            broadcast({ action: 'updateState', content: JSON.stringify(gameState) });
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