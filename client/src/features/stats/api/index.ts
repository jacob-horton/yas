import type { Sort } from "@/components/ui/table";
import type { Scoreboard } from "@/features/games/types/scoreboard";
import { api } from "@/lib/api";
import type {
  DistributionData,
  PlayerHighlightStats,
  PlayerHistory,
} from "../types";

export interface StatsApiContract {
  getPlayerHistory(playerId: string, season?: string): Promise<PlayerHistory>;
  getPlayerHighlights(
    playerId: string,
    season?: string,
  ): Promise<PlayerHighlightStats>;
  getDistributions(season?: string): Promise<DistributionData>;
  getScoreboard<T extends string>(
    season?: string,
    sort?: Sort<T>,
  ): Promise<Scoreboard>;
}

export class StatsApi implements StatsApiContract {
  constructor(private gameId: string) {}

  // TODO: player stats into separate contract?
  public async getPlayerHistory(
    playerId: string,
    season?: string,
  ): Promise<PlayerHistory> {
    return api
      .get(`/games/${this.gameId}/players/${playerId}/history`, {
        params: { season: season ?? "latest" },
      })
      .then((resp) => resp.data);
  }

  public async getPlayerHighlights(
    playerId: string,
    season?: string,
  ): Promise<PlayerHighlightStats> {
    return api
      .get(`/games/${this.gameId}/players/${playerId}/highlights`, {
        params: { season: season ?? "latest" },
      })
      .then((resp) => resp.data);
  }

  public async getDistributions(season?: string): Promise<DistributionData> {
    return api
      .get(`/games/${this.gameId}/distributions`, {
        params: { season: season ?? "latest" },
      })
      .then((resp) => resp.data);
  }

  public async getScoreboard<T extends string>(
    season?: string,
    sort?: Sort<T>,
  ): Promise<Scoreboard> {
    let params: Record<string, unknown> = { season: season ?? "latest" };
    if (sort) {
      params = {
        ...params,
        order_by: sort.property,
        order_dir: sort.direction,
      };
    }

    return api
      .get(`/games/${this.gameId}/scoreboard`, { params })
      .then((resp) => resp.data);
  }
}
