import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { usersApi } from "../api";
import { userKeys } from "./query-keys";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: {
      name: string;
      avatar: string;
      avatarColour: string;
    }) => usersApi.updateMe(data.name, data.avatar, data.avatarColour),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to update user",
      });
    },
  }));
};
