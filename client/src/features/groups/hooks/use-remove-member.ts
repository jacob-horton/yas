import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupsApi } from "../api";
import { groupKeys } from "./query-keys";

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: { groupId: string; memberId: string }) =>
      groupsApi.group(data.groupId).member(data.memberId).delete(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.members(variables.groupId),
      });
    },
    onError: () => {
      toast.error({ title: "Error", description: "Failed to remove member" });
    },
  }));
};
