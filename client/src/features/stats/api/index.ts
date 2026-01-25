import type { Scoreboard } from "@/features/games/types/scoreboard";
import { api } from "@/lib/api";
import type { MatchStats } from "../types";

export interface StatsApiContract {
  getPlayerStats(playerId: string): Promise<MatchStats[]>;
  getScoreboard(): Promise<Scoreboard>;
}

export class StatsApi implements StatsApiContract {
  public constructor(private gameId: string) {}

  public async getPlayerStats(playerId: string): Promise<MatchStats[]> {
    return api
      .get(`/games/${this.gameId}/player-stats/${playerId}`)
      .then((resp) => resp.data);
  }

  public async getScoreboard(): Promise<Scoreboard> {
    return api
      .get(`/games/${this.gameId}/scoreboard`)
      .then((resp) => resp.data);
  }
}
