import { useMutation } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { usersApi } from "../api";

export const useUpdatePassword = () => {
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      usersApi.updateMyPassword(data.currentPassword, data.newPassword),
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to update password",
      });
    },
  }));
};
