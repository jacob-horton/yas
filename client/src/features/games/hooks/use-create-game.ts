import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupsApi } from "@/features/groups/api";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import type { CreateGameRequest } from "../types/game";

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: { groupId: string; payload: CreateGameRequest }) =>
      groupsApi.group(data.groupId).createGame(data.payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: groupKeys.games(variables.groupId),
      });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to create game",
      });
    },
  }));
};
