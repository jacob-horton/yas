import type { CreateMatchRequest, Match } from "@/features/matches/types";
import { StatsApi, type StatsApiContract } from "@/features/stats/api";
import { api } from "@/lib/api";
import type { Game, UpdateGameRequest } from "../types/game";

export interface GameApiContract {
  get(): Promise<Game>;
  createMatch(match: CreateMatchRequest): Promise<Match>;
  lastPlayers(): Promise<string[]>;

  update(payload: UpdateGameRequest): Promise<Game>;

  stats(): StatsApiContract;
}

export class GameApi implements GameApiContract {
  constructor(private gameId: string) {}

  public async get(): Promise<Game> {
    return api.get(`/games/${this.gameId}`).then((resp) => resp.data);
  }

  public async update(payload: UpdateGameRequest): Promise<Game> {
    return api.put(`/games/${this.gameId}`, payload).then((resp) => resp.data);
  }

  public async createMatch(match: CreateMatchRequest): Promise<Match> {
    return api
      .post(`/games/${this.gameId}/matches`, match)
      .then((resp) => resp.data);
  }

  public async lastPlayers(): Promise<string[]> {
    return api
      .get(`/games/${this.gameId}/last-players`)
      .then((resp) => resp.data);
  }

  public stats(): StatsApiContract {
    return new StatsApi(this.gameId);
  }
}
