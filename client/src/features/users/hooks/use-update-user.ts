import { useQueryClient } from "@tanstack/solid-query";
import { useAppMutation } from "@/lib/use-app-mutation";
import { usersApi } from "../api";
import { userKeys } from "./query-keys";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useAppMutation(
    () => ({
      mutationFn: (data: {
        name: string;
        avatar: string;
        avatarColour: string;
      }) => usersApi.updateMe(data.name, data.avatar, data.avatarColour),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userKeys.me() });
      },
    }),
    () => ({ errorMessage: "Failed to update user" }),
  );
};
