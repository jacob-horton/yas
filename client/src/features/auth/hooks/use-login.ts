import { useQueryClient } from "@tanstack/solid-query";
import { userKeys } from "@/features/users/hooks/query-keys";
import { isApiError } from "@/lib/api";
import { useAppMutation } from "@/lib/use-app-mutation";
import { authApi } from "../api";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: async (data: { email: string; password: string }) => {
        const user = await authApi.login(data.email, data.password);
        queryClient.setQueryData(userKeys.me(), user);
      },
    }),
    () => ({
      errorMessage: (error) => {
        if (isApiError(error) && error.status === 401) {
          return "Email or password is incorrect";
        }

        return "Failed to log in";
      },
    }),
  );
};
