import { useMutation, useQueryClient } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { useToast } from "@/context/toast-context";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { invitesApi } from "@/features/invites/api";

export const useDeleteInvite = (groupId: Accessor<string>) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (inviteId: string) => invitesApi.invite(inviteId).delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.invites(groupId()),
      });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to delete invite",
      });
    },
  }));
};
