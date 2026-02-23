import { useQueryClient } from "@tanstack/solid-query";
import { useAppMutation } from "@/lib/use-app-mutation";
import { usersApi } from "../api";
import { userKeys } from "./query-keys";

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (newEmail: string) => usersApi.updateMyEmail(newEmail),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userKeys.me() });
      },
    }),
    () => ({ errorMessage: "Failed to update email" }),
  );
};
