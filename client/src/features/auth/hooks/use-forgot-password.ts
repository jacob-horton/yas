import { useAppMutation } from "@/lib/use-app-mutation";
import { authApi } from "../api";

export const useForgotPassword = () => {
  return useAppMutation(
    () => ({
      mutationFn: (email: string) => authApi.forgotPassword(email),
    }),
    () => ({ errorMessage: "Failed to request password reset" }),
  );
};
