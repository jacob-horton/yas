import { useAppMutation } from "@/lib/use-app-mutation";
import { usersApi } from "../api";

export const useUpdatePassword = () => {
  return useAppMutation(
    () => ({
      mutationFn: (data: { current_password: string; new_password: string }) =>
        usersApi.updateMyPassword(data.current_password, data.new_password),
    }),
    () => ({ errorMessage: "Failed to update password" }),
  );
};
