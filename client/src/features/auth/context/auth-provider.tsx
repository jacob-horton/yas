import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { isAxiosError } from "axios";
import {
  type Accessor,
  createContext,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { authApi } from "@/features/auth/api";
import { usersApi } from "@/features/users/api";
import { userKeys } from "@/features/users/hooks/query-keys";
import type { User } from "@/features/users/types";
import { setupAxiosInterceptors } from "@/lib/api";
import { LS_LAST_GROUP_ID } from "@/pages/home-page";

type ErrorDetail = {
  property: string;
  codes: string;
};

type DetailedStatusError = {
  message: string;
  details: ErrorDetail[];
};

export type AuthContextValue = {
  user: Accessor<User | null | undefined>;
  loading: Accessor<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<DetailedStatusError | null>;
};

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider: ParentComponent = (props) => {
  const queryClient = useQueryClient();
  const [isAuthenticating, setIsAuthenticating] = createSignal(false);

  const meQuery = useQuery(() => ({
    queryKey: userKeys.me(),
    queryFn: async () => {
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

    loading: () =>
      meQuery.isPending || meQuery.isFetching || isAuthenticating(),

    login: async (email: string, password: string) => {
      setIsAuthenticating(true);
      try {
        const user = await authApi.login(email, password);
        queryClient.setQueryData(userKeys.me(), user);
      } finally {
        setIsAuthenticating(false);
      }
    },

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

    register: async (name, email, password) => {
      setIsAuthenticating(true);
      try {
        const user = await usersApi.create({ name, email, password });
        queryClient.setQueryData(userKeys.me(), user);
        return null;
      } catch (e) {
        if (isAxiosError(e) && (e.status === 409 || e.status === 400)) {
          return (await e.response?.data) as DetailedStatusError;
        }
        throw e;
      } finally {
        setIsAuthenticating(false);
      }
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
