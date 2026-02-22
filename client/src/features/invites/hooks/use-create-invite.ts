import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupsApi } from "@/features/groups/api";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import type { CreateInviteRequest } from "../types/invite";

export const useCreateInvite = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: { groupId: string; payload: CreateInviteRequest }) =>
      groupsApi.group(data.groupId).createInvite(data.payload),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.invites(variables.groupId),
      });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to create invite",
      });
    },
  }));
};
