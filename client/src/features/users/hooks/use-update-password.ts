import { useMutation } from "@tanstack/solid-query";
import { useToast } from "@/context/toast-context";
import { usersApi } from "../api";

export const useUpdatePassword = () => {
  const toast = useToast();

  return useMutation(() => ({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      usersApi.updateMyPassword(data.current_password, data.new_password),
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to update password",
      });
    },
  }));
};
