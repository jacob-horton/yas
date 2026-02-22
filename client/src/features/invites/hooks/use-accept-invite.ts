import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { invitesApi } from "../api";

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (inviteId: string) => invitesApi.invite(inviteId).accept(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: groupKeys.myGroups(),
      });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to accept invite",
      });
    },
  }));
};
