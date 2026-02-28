import { type UseMutationOptions, useMutation } from "@tanstack/solid-query";
import { isAxiosError } from "axios";
import { useToast } from "@/context/toast-context";

type AppMutationOptions<TError> = {
  errorMessage?: string | ((error: TError) => string);
};

export const useAppMutation = <
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>,
  appMutationOptions: () => AppMutationOptions<TError>,
) => {
  const toast = useToast();

  return useMutation(() => {
    const options = mutationOptions();

    return {
      ...options,
      onError: (err, variables, context, mutFn) => {
        if (isAxiosError(err) && err.response?.status === 429) {
          toast.error({
            title: "Rate Limit",
            description: "Too many requests. Please slow down!",
          });
        } else {
          let errorMessage = "An unexpected error occurred";
          const userMessage = appMutationOptions().errorMessage;
          if (typeof userMessage === "string") {
            errorMessage = userMessage;
          } else if (typeof userMessage === "function") {
            errorMessage = userMessage(err);
          }

          toast.error({
            title: "Error",
            description: errorMessage,
          });
        }

        options.onError?.(err, variables, context, mutFn);
      },
    };
  });
};
