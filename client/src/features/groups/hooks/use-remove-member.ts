import { useQueryClient } from "@tanstack/solid-query";
import { useAppMutation } from "@/lib/use-app-mutation";
import { groupsApi } from "../api";
import { groupKeys } from "./query-keys";

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (data: { groupId: string; memberId: string }) =>
        groupsApi.group(data.groupId).member(data.memberId).delete(),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: groupKeys.members(variables.groupId),
        });
      },
    }),
    () => ({ errorMessage: "Failed to remove member" }),
  );
};
