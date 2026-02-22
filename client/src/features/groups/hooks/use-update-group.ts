import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupsApi } from "@/features/groups/api";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import type { UpdateGroupRequest } from "../types";

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: { groupId: string; payload: UpdateGroupRequest }) =>
      groupsApi.group(data.groupId).update(data.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to update group",
      });
    },
  }));
};
