import type { CreateMatchRequest, Match } from "@/features/matches/types";
import { api } from "@/lib/api";
import type { Game, Scoreboard } from "../types";

export interface GameApiContract {
  get(): Promise<Game>;
  createMatch(match: CreateMatchRequest): Promise<Match>;
  getScoreboard(): Promise<Scoreboard>;
}

export class GameApi implements GameApiContract {
  constructor(private gameId: string) {}

  public async get(): Promise<Game> {
    return api.get(`/games/${this.gameId}`).then((resp) => resp.data);
  }

  public async getScoreboard(): Promise<Scoreboard> {
    return api
      .get(`/games/${this.gameId}/scoreboard`)
      .then((resp) => resp.data);
  }

  public createMatch(match: CreateMatchRequest): Promise<Match> {
    return api.post(`/games/${this.gameId}/matches`, match);
  }
}
