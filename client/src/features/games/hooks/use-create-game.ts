import { useQueryClient } from "@tanstack/solid-query";
import { groupsApi } from "@/features/groups/api";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";
import type { CreateGameRequest } from "../types/game";

export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (data: { groupId: string; payload: CreateGameRequest }) =>
        groupsApi.group(data.groupId).createGame(data.payload),
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({
          queryKey: groupKeys.games(variables.groupId),
        });
      },
    }),
    () => ({ errorMessage: "Failed to create game" }),
  );
};
