import { api } from "@/lib/api";

export interface GroupMemberApiContract {
  delete(): Promise<void>;
}

export class GroupMemberApi implements GroupMemberApiContract {
  constructor(
    private groupId: string,
    private userId: string,
  ) {}

  public async delete(): Promise<void> {
    return api.delete(`/groups/${this.groupId}/member/${this.userId}`);
  }
}
