export type InviteDetail = {
  id: string;
  created_by_name: string;
  expires_at: string;

  group_id: string;
  group_name: string;

  is_current_user_member: boolean;
};

export type InviteSummary = {
  id: string;
  name: string;
  created_by: string;
  max_uses: number | null;
  uses: number;
  created_at: string;
  expires_at: string;
};

export type CreateInviteRequest = {
  name: string;
  expires_at: string | null;
  max_uses: number | null;
};
