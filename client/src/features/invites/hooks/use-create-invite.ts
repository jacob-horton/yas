import { useQueryClient } from "@tanstack/solid-query";
import { groupsApi } from "@/features/groups/api";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import type { CreateInviteRequest } from "../types/invite";

export const useCreateInvite = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (data: { groupId: string; payload: CreateInviteRequest }) =>
        groupsApi.group(data.groupId).createInvite(data.payload),
      onSuccess: async (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: groupKeys.invites(variables.groupId),
        });
      },
    }),
    () => ({ errorMessage: "Failed to create invite" }),
  );
};
