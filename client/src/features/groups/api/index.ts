import { api } from "@/lib/api";
import type { CreateGroupRequest, Group } from "../types";
import { GroupApi, type GroupApiContract } from "./group-api";

export interface GroupsApiContract {
  create(payload: CreateGroupRequest): Promise<Group>;
  listForUser(): Promise<Group[]>;

  group(groupId: string): GroupApiContract;
}

class GroupsApi implements GroupsApiContract {
  public async create(payload: CreateGroupRequest): Promise<Group> {
    return api.post("/groups", payload).then((resp) => resp.data);
  }

  public async listForUser(): Promise<Group[]> {
    return api.get("/users/me/groups").then((resp) => resp.data);
  }

  public group(groupId: string): GroupApiContract {
    return new GroupApi(groupId);
  }
}

export const groupsApi = new GroupsApi();
