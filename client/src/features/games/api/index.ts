import { api } from "@/lib/api";
import type { CreateGameRequest, Game } from "../types";
import { GameApi, type GameApiContract } from "./game-api";

export interface GamesApiContract {
  game(gameId: string): GameApiContract;
}

class GamesApi implements GamesApiContract {
  public async create(payload: CreateGameRequest): Promise<Game> {
    return api.post("/games", payload).then((resp) => resp.data);
  }

  public game(gameId: string): GameApiContract {
    return new GameApi(gameId);
  }
}

export const gamesApi = new GamesApi();
