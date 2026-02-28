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
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: groupKeys.all,
        });
      },
    }),
    () => ({ errorMessage: "Failed to remove member" }),
  );
};
