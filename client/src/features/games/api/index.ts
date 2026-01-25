import { GameApi, type GameApiContract } from "./game-api";

export interface GamesApiContract {
  game(gameId: string): GameApiContract;
}

class GamesApi implements GamesApiContract {
  public game(gameId: string): GameApiContract {
    return new GameApi(gameId);
  }
}

export const gamesApi = new GamesApi();
