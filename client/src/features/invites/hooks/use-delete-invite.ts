import { useQueryClient } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { invitesApi } from "@/features/invites/api";
import { useAppMutation } from "@/lib/use-app-mutation";

export const useDeleteInvite = (groupId: Accessor<string>) => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (inviteId: string) => invitesApi.invite(inviteId).delete(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: groupKeys.invites(groupId()),
        });
      },
    }),
    () => ({ errorMessage: "Failed to delete invite" }),
  );
};
