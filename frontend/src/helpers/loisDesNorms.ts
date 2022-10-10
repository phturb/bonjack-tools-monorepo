export type LeagueOfLegendsRole = "ADC" | "MID" | "JUNGLE" | "SUPPORT" | "TOP";

export type MessageActions = "updatePlayers" | "updateState";

export interface Player {
  player: DiscordPlayer;
  role: LeagueOfLegendsRole | undefined;
}

export interface DiscordPlayer {
  id: string;
  name: string | undefined;
}

export const emptyDiscordPlayer = (): DiscordPlayer => {
  return { id: "", name: undefined };
};

export const emptyPlayer = (): Player => {
  return { player: emptyDiscordPlayer(), role: undefined };
};
