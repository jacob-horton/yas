import { useQueryClient } from "@tanstack/solid-query";
import { useAppMutation } from "@/lib/use-app-mutation";
import { usersApi } from "../api";
import { userKeys } from "./query-keys";

export const useResendVerification = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: () => usersApi.resendVerification(),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userKeys.me() });
      },
    }),
    () => ({ errorMessage: "Failed to update email" }),
  );
};
