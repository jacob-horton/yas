import { useQueryClient } from "@tanstack/solid-query";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import { gamesApi } from "../api";
import type { UpdateGameRequest } from "../types/game";
import { gameKeys } from "./query-keys";

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
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
    }),
    () => ({ errorMessage: "Failed to update game" }),
  );
};
