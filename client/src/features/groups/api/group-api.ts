import type { CreateGameRequest, Game } from "@/features/games/types/game";
import type {
  CreateInviteRequest,
  InviteSummary,
} from "@/features/invites/types/invite";
import { api } from "@/lib/api";
import type { Group, GroupMember } from "../types";

export interface GroupApiContract {
  get(): Promise<Group>;
  members(): Promise<GroupMember[]>;
  games(): Promise<Game[]>;
  invites(): Promise<InviteSummary[]>;
  delete(): Promise<void>;

  createGame(payload: CreateGameRequest): Promise<Game>;
  createInvite(payload: CreateInviteRequest): Promise<InviteSummary>;
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

  public async invites(): Promise<InviteSummary[]> {
    return api.get(`/groups/${this.groupId}/invites`).then((resp) => resp.data);
  }

  public async delete(): Promise<void> {
    return api.delete(`/groups/${this.groupId}`);
  }

  public async createGame(payload: CreateGameRequest): Promise<Game> {
    return api
      .post(`/groups/${this.groupId}/games`, payload)
      .then((resp) => resp.data);
  }

  public async createInvite(
    payload: CreateInviteRequest,
  ): Promise<InviteSummary> {
    return api
      .post(`/groups/${this.groupId}/invites`, payload)
      .then((resp) => resp.data);
  }
}
