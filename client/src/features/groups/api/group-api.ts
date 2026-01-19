import { api } from "@/lib/api";
import type { Group, GroupMember } from "../types";

export interface GroupApiContract {
  get(): Promise<Group>;
  members(): Promise<GroupMember[]>;
}

export class GroupApi implements GroupApiContract {
  constructor(private groupId: string) {}

  public async get(): Promise<Group> {
    return api.get(`/groups/${this.groupId}`).then((resp) => resp.data);
  }

  public async members(): Promise<GroupMember[]> {
    return api.get(`/groups/${this.groupId}/members`).then((resp) => resp.data);
  }
}
