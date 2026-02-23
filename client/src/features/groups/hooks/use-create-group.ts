import { useQueryClient } from "@tanstack/solid-query";
import { groupsApi } from "@/features/groups/api";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import type { CreateGroupRequest } from "../types";

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (payload: CreateGroupRequest) => groupsApi.create(payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: groupKeys.myGroups(),
        });
      },
    }),
    () => ({ errorMessage: "Failed to create group" }),
  );
};
