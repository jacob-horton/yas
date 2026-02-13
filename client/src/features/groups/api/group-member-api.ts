import { api } from "@/lib/api";
import type { MemberRole } from "../types";

export interface GroupMemberApiContract {
  delete(): Promise<void>;
  updateRole(role: MemberRole): Promise<void>;
}

export class GroupMemberApi implements GroupMemberApiContract {
  constructor(
    private groupId: string,
    private userId: string,
  ) {}

  public async delete(): Promise<void> {
    return api.delete(`/groups/${this.groupId}/member/${this.userId}`);
  }

  public async updateRole(role: MemberRole): Promise<void> {
    return api.put(`/groups/${this.groupId}/member/${this.userId}/role`, {
      role,
    });
  }
}
