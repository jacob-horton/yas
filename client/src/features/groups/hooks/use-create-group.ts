import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupsApi } from "@/features/groups/api";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import type { CreateGroupRequest } from "../types";

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (payload: CreateGroupRequest) => groupsApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: groupKeys.myGroups(),
      });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to create group",
      });
    },
  }));
};
