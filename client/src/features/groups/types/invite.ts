export type Invite = {
  id: string;
  created_by: string;
  max_uses: number | null;
  uses: number;
  created_at: string;
  expires_at: string;
};
