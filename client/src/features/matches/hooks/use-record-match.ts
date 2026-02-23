import { useQueryClient } from "@tanstack/solid-query";
import { gamesApi } from "@/features/games/api";
import { gameKeys } from "@/features/games/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import type { CreateMatchRequest } from "../types";

export const useRecordMatch = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (data: { gameId: string; payload: CreateMatchRequest }) =>
        gamesApi.game(data.gameId).createMatch(data.payload),
      onSuccess: async (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: gameKeys.game(variables.gameId),
        });
      },
    }),
    () => ({ errorMessage: "Failed to record match" }),
  );
};
