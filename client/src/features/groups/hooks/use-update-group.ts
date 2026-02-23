import { useQueryClient } from "@tanstack/solid-query";
import { groupsApi } from "@/features/groups/api";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import type { UpdateGroupRequest } from "../types";

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (data: { groupId: string; payload: UpdateGroupRequest }) =>
        groupsApi.group(data.groupId).update(data.payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: groupKeys.all });
      },
    }),
    () => ({ errorMessage: "Failed to update group" }),
  );
};
