import type { CreateGameRequest, Game } from "@/features/games/types";
import { api } from "@/lib/api";
import type { Group, GroupMember } from "../types";

export interface GroupApiContract {
  get(): Promise<Group>;
  members(): Promise<GroupMember[]>;
  games(): Promise<Game[]>;

  createGame(payload: CreateGameRequest): Promise<Game>;
}

export class GroupApi implements GroupApiContract {
  constructor(private groupId: string) {}

  public async get(): Promise<Group> {
    return api.get(`/groups/${this.groupId}`).then((resp) => resp.data);
  }

  public async members(): Promise<GroupMember[]> {
    return api.get(`/groups/${this.groupId}/members`).then((resp) => resp.data);
  }

  public async games(): Promise<Game[]> {
    return api.get(`/groups/${this.groupId}/games`).then((resp) => resp.data);
  }

  public async createGame(payload: CreateGameRequest): Promise<Game> {
    return api
      .post(`/groups/${this.groupId}/games`, payload)
      .then((resp) => resp.data);
  }
}
