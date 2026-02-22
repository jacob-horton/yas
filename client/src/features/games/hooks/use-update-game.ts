import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { gamesApi } from "../api";
import type { UpdateGameRequest } from "../types/game";
import { gameKeys } from "./query-keys";

export const useUpdateGame = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: { groupId: string; payload: UpdateGameRequest }) =>
      gamesApi.game(data.groupId).update(data.payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: gameKeys.game(variables.groupId),
      });
      await queryClient.invalidateQueries({
        queryKey: groupKeys.games(variables.groupId),
      });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to update game",
      });
    },
  }));
};
