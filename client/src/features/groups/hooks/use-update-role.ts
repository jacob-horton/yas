import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupsApi } from "../api";
import type { MemberRole } from "../types";
import { groupKeys } from "./query-keys";

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: {
      groupId: string;
      memberId: string;
      role: MemberRole;
    }) =>
      groupsApi.group(data.groupId).member(data.memberId).updateRole(data.role),
    onSuccess: (_, variables) => {
      console.log(variables.groupId);
      queryClient.invalidateQueries({
        queryKey: groupKeys.members(variables.groupId),
      });
    },
    onError: () => {
      toast.error({ title: "Error", description: "Failed to update role" });
    },
  }));
};
