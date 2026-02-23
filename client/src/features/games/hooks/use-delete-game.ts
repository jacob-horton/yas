import { useQueryClient } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import { gamesApi } from "../api";

export const useDeleteGame = (groupId: Accessor<string>) => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (gameId: string) => gamesApi.game(gameId).delete(),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: groupKeys.games(groupId()),
        });
      },
    }),
    () => ({ errorMessage: "Failed to delete game" }),
  );
};
