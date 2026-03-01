import { useQueryClient } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import { gamesApi } from "../api";
import type { UpdateGameRequest } from "../types/game";
import { gameKeys } from "./query-keys";

export const useUpdateGame = (groupId: Accessor<string>) => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (data: { gameId: string; payload: UpdateGameRequest }) =>
        gamesApi.game(data.gameId).update(data.payload),
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({
          queryKey: gameKeys.game(variables.gameId),
        });
        await queryClient.invalidateQueries({
          queryKey: groupKeys.games(groupId()),
        });
      },
    }),
    () => ({ errorMessage: "Failed to update game" }),
  );
};
