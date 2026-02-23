import { useQueryClient } from "@tanstack/solid-query";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import { invitesApi } from "../api";

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (inviteId: string) => invitesApi.invite(inviteId).accept(),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: groupKeys.myGroups(),
        });
      },
    }),
    () => ({ errorMessage: "Failed to accept invite" }),
  );
};
