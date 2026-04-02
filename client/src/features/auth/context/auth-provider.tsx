import { useQuery, useQueryClient } from "@tanstack/solid-query";
import {
  type Accessor,
  createContext,
  type ParentComponent,
  useContext,
} from "solid-js";
import { authApi } from "@/features/auth/api";
import { LS_LAST_GROUP_ID } from "@/features/home/constants";
import { usersApi } from "@/features/users/api";
import { userKeys } from "@/features/users/hooks/query-keys";
import type { User } from "@/features/users/types";
import { setupAxiosInterceptors } from "@/lib/api";

declare global {
  interface Window {
    _PRELOADED_USER?: Promise<User | null>;
  }
}

export type AuthContextValue = {
  user: Accessor<User | null | undefined>;
  loading: Accessor<boolean>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider: ParentComponent = (props) => {
  const queryClient = useQueryClient();

  const meQuery = useQuery(() => ({
    queryKey: userKeys.me(),
    queryFn: async () => {
      if (window._PRELOADED_USER) {
        const promise = window._PRELOADED_USER;
        delete window._PRELOADED_USER;

        const data = await promise;
        if (data) return data;
      }

      try {
        return await usersApi.me();
      } catch (_err) {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  }));

  const authContextValue: AuthContextValue = {
    user: () => meQuery.data,

    loading: () => meQuery.isPending || meQuery.isFetching,

    logout: async () => {
      await authApi.logout();
      authContextValue.clearSession();
    },

    clearSession: () => {
      localStorage.removeItem(LS_LAST_GROUP_ID);
      queryClient.setQueryData(userKeys.me(), null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== userKeys.me()[0],
      });
    },
  };

  setupAxiosInterceptors(authContextValue.clearSession);

  return (
    <AuthContext.Provider value={authContextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used within AuthContext");
  return auth;
};
