import { InviteApi, type InviteApiContract } from "./invite-api";

export interface InvitesApiContract {
  invite(inviteId: string): InviteApiContract;
}

class InvitesApi implements InvitesApiContract {
  public invite(inviteId: string): InviteApiContract {
    return new InviteApi(inviteId);
  }
}

export const invitesApi = new InvitesApi();
