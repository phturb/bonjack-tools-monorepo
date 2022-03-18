import { GameState } from "./interfaces/gameState.interface";
import { Server as HttpServer} from 'http';
import { WebSocket, Server as WebSocketServer } from 'ws';
import DiscordManager from "./discordManager";

class GameManager {

    roles: string[];
    gameState: GameState;
    discordManager: DiscordManager;
    httpServer: HttpServer;
    webSocketServer: WebSocketServer;

    constructor(discordManager: DiscordManager, httpServer: HttpServer, webSocketServer: WebSocketServer) {
        this.discordManager = discordManager;
        this.httpServer = httpServer;
        this.webSocketServer = webSocketServer;
        this.gameState = {
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

        this.roles = ['ADC', 'MID', 'JUNGLE', 'SUPPORT', 'TOP'];
    }

    randomizeRoles() {
        for (let i = this.roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.roles[i];
            this.roles[i] = this.roles[j];
            this.roles[j] = temp;
        }
    }

}

export default GameManager;