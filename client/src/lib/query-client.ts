import { QueryClient } from "@tanstack/solid-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry for client errors (4xx)
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }

        // Otherwise, retry up to 3 times for 5xx or network errors
        return failureCount < 3;
      },
    },
  },
});
