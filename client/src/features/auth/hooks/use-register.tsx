import { useQueryClient } from "@tanstack/solid-query";
import { usersApi } from "@/features/users/api";
import { userKeys } from "@/features/users/hooks/query-keys";
import { useAppMutation } from "@/lib/use-app-mutation";

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: async (data: {
        name: string;
        email: string;
        password: string;
      }) => {
        const user = await usersApi.create({
          name: data.name,
          email: data.email,
          password: data.password,
        });
        queryClient.setQueryData(userKeys.me(), user);
      },
    }),
    () => ({ errorMessage: "Failed to register" }),
  );
};
