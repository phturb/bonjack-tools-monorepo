interface DiscordPlayer {
  id: string;
  name: string | undefined;
}

interface GamePlayer {
  player: DiscordPlayer;
  role: string | undefined;
}

interface GameState {
  players: GamePlayer[];
  rollCount: number;
  gameInProgress: boolean;
  availablePlayers: any;
  gameId: number;
}

export {DiscordPlayer, GamePlayer, GameState};