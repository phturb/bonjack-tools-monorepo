export type LeagueOfLegendsRole = "ADC" | "MID" | "JUNGLE" | "SUPPORT" | "TOP";

export type MessageActions = 'updatePlayers' | 'updateState';

export interface Player {
  player: DiscordPlayer;
  role: LeagueOfLegendsRole | undefined;
}

export interface DiscordPlayer {
  id: string;
  name: string | undefined;
}
