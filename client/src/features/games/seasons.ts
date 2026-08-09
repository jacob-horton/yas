import type { Season } from "./types/scoreboard";

export function seasonName(season?: Season) {
  if (!season) {
    return "";
  }

  return season.name ?? `Season ${season.number}`;
}

export function seasonSessionKey(gameId: string) {
  return `season:${gameId}`;
}
