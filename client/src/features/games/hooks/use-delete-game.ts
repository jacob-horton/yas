import { useMutation, useQueryClient } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { useToast } from "@/context/toast-context";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { gamesApi } from "../api";

export const useDeleteGame = (groupId: Accessor<string>) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (gameId: string) => gamesApi.game(gameId).delete(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: groupKeys.games(groupId()),
      });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to delete game",
      });
    },
  }));
};
