import { useAppMutation } from "@/lib/use-app-mutation";
import { authApi } from "../api";

export const useResetPassword = () => {
  return useAppMutation(
    () => ({
      mutationFn: (data: { token: string; password: string }) =>
        authApi.resetPassword(data.token, data.password),
    }),
    () => ({ errorMessage: "Failed to reset password" }),
  );
};
