import { useQueryClient } from "@tanstack/solid-query";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import { groupsApi } from "../api";

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (groupId: string) => groupsApi.group(groupId).delete(),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: groupKeys.myGroups() });
      },
    }),
    () => ({ errorMessage: "Failed to delete group" }),
  );
};
