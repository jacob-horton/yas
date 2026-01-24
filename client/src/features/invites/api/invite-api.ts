import { api } from "@/lib/api";
import type { InviteDetail } from "../types/invite";

export interface InviteApiContract {
  get(): Promise<InviteDetail>;
  accept(): Promise<void>;
}

export class InviteApi implements InviteApiContract {
  constructor(private inviteId: string) {}

  public async get(): Promise<InviteDetail> {
    return api.get(`/invites/${this.inviteId}`).then((resp) => resp.data);
  }

  public async accept(): Promise<void> {
    return api.post(`/invites/${this.inviteId}/accept`);
  }
}
