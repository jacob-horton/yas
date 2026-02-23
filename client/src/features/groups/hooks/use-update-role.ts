import { useQueryClient } from "@tanstack/solid-query";
import { useAppMutation } from "@/lib/use-app-mutation";
import { groupsApi } from "../api";
import type { MemberRole } from "../types";
import { groupKeys } from "./query-keys";

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (data: {
        groupId: string;
        memberId: string;
        role: MemberRole;
      }) =>
        groupsApi
          .group(data.groupId)
          .member(data.memberId)
          .updateRole(data.role),
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({
          queryKey: groupKeys.members(variables.groupId),
        });
      },
    }),
    () => ({ errorMessage: "Failed to update role" }),
  );
};
