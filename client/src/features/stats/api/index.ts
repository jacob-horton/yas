import type { Sort } from "@/components/ui/table";
import type { Scoreboard } from "@/features/games/types/scoreboard";
import { api } from "@/lib/api";
import type {
  DistributionData,
  MatchStats,
  PlayerHighlightStats,
} from "../types";

export interface StatsApiContract {
  getPlayerHistory(playerId: string): Promise<MatchStats[]>;
  getPlayerHighlights(playerId: string): Promise<PlayerHighlightStats>;
  getDistributions(): Promise<DistributionData>;
  getScoreboard<T extends string>(sort?: Sort<T>): Promise<Scoreboard>;
}

export class StatsApi implements StatsApiContract {
  constructor(private gameId: string) {}

  // TODO: player stats into separate contract
  public async getPlayerHistory(playerId: string): Promise<MatchStats[]> {
    return api
      .get(`/games/${this.gameId}/players/${playerId}/history`)
      .then((resp) => resp.data);
  }

  public async getPlayerHighlights(
    playerId: string,
  ): Promise<PlayerHighlightStats> {
    return api
      .get(`/games/${this.gameId}/players/${playerId}/highlights`)
      .then((resp) => resp.data);
  }

  public async getDistributions(): Promise<DistributionData> {
    return api
      .get(`/games/${this.gameId}/distributions`)
      .then((resp) => resp.data);
  }

  public async getScoreboard<T extends string>(
    sort?: Sort<T>,
  ): Promise<Scoreboard> {
    let params = {};
    if (sort) {
      params = {
        order_by: sort.property,
        order_dir: sort.direction,
      };
    }

    return api
      .get(`/games/${this.gameId}/scoreboard`, { params })
      .then((resp) => resp.data);
  }
}
