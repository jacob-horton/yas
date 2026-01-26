import type { Scoreboard } from "@/features/games/types/scoreboard";
import { api } from "@/lib/api";
import type { MatchStats, PlayerStatsSummary } from "../types";

export interface StatsApiContract {
  getPlayerHistory(playerId: string): Promise<MatchStats[]>;
  getPlayerSummary(playerId: string): Promise<PlayerStatsSummary>;
  getScoreboard(): Promise<Scoreboard>;
}

export class StatsApi implements StatsApiContract {
  constructor(private gameId: string) {}

  // TODO: player stats into separate contract
  public async getPlayerHistory(playerId: string): Promise<MatchStats[]> {
    return api
      .get(`/games/${this.gameId}/players/${playerId}/history`)
      .then((resp) => resp.data);
  }

  public async getPlayerSummary(playerId: string): Promise<PlayerStatsSummary> {
    return api
      .get(`/games/${this.gameId}/players/${playerId}/summary`)
      .then((resp) => resp.data);
  }

  public async getScoreboard(): Promise<Scoreboard> {
    return api
      .get(`/games/${this.gameId}/scoreboard`)
      .then((resp) => resp.data);
  }
}
