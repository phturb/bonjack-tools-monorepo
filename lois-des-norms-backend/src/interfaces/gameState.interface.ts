export type LeagueOfLegendsRole = "ADC" | "MID" | "JUNGLE" | "SUPPORT" | "TOP";

export type MessageActions = 'updatePlayers' | 'updateState';

interface DiscordPlayer {
  id: string;
  name: string | undefined;
};

interface GamePlayer {
  player: DiscordPlayer;
  role: string | undefined;
};

interface GameState {
  players: GamePlayer[];
  rollCount: number;
  gameInProgress: boolean;
  availablePlayers: any;
  gameId: number;
  nextRollTimer: number;
  canRoll: boolean;
  discordGuild: string,
  discordGuildChannel: string,
};

const emptyDiscordPlayer = (): DiscordPlayer => {return { id: "", name: undefined };};

const emptyPlayer = (): GamePlayer => {return {player: emptyDiscordPlayer(), role: undefined};};

export {DiscordPlayer, emptyDiscordPlayer, GamePlayer, GameState, emptyPlayer};
