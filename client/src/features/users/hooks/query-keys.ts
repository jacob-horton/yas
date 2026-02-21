export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,

  user: (userId: string) => [...userKeys.all, userId] as const,
};
