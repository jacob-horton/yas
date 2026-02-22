import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import type { CreateMatchRequest } from "../types";
import { gamesApi } from "@/features/games/api";
import { gameKeys } from "@/features/games/hooks/query-keys";

export const useRecordMatch = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: { gameId: string; payload: CreateMatchRequest }) =>
      gamesApi.game(data.gameId).createMatch(data.payload),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gameKeys.game(variables.gameId),
      });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to record match",
      });
    },
  }));
};
