import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { usersApi } from "../api";
import { userKeys } from "./query-keys";

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (newEmail: string) => usersApi.updateMyEmail(newEmail),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to update email",
      });
    },
  }));
};
