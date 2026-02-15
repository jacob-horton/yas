export const userKeys = {
  all: ["users"] as const,

  user: (userId: string) => [...userKeys.all, userId] as const,
};
