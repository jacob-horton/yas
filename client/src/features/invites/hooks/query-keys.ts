export const inviteKeys = {
  all: ["invites"] as const,

  invite: (inviteId: string) => [...inviteKeys.all, inviteId] as const,
};
