import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { groupsApi } from "../api";

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (groupId: string) => groupsApi.group(groupId).delete(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupKeys.myGroups() });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to delete group",
      });
    },
  }));
};
