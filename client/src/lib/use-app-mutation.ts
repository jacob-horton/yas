import { type UseMutationOptions, useMutation } from "@tanstack/solid-query";
import { isAxiosError } from "axios";
import { useToast } from "@/context/toast-context";

type AppMutationOptions = {
  errorMessage?: string;
};

export const useAppMutation = <
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>,
  appMutationOptions: () => AppMutationOptions,
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
          toast.error({
            title: "Error",
            description:
              appMutationOptions().errorMessage ??
              "An unexpected error occurred",
          });
        }

        options.onError?.(err, variables, context, mutFn);
      },
    };
  });
};
