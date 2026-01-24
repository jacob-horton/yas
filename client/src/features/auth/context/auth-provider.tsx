import { isAxiosError } from "axios";
import {
  type Accessor,
  createContext,
  createSignal,
  onMount,
  type ParentComponent,
  useContext,
} from "solid-js";
import { setupAxiosInterceptors } from "@/lib/api";
import { authApi } from "@/features/auth/api";
import type { User } from "@/features/users/types";
import { usersApi } from "@/features/users/api";

type DetailedStatusError = {
  message: string;
  details: ErrorDetail[];
};

type ErrorDetail = {
  property: string;
  codes: string;
};

const AuthContext = createContext<{
  user: Accessor<User | null>;
  loading: Accessor<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<DetailedStatusError | null>;
}>();

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null);
  const [loading, setLoading] = createSignal(true);

  async function login(email: string, password: string) {
    // TODO: try/catch
    const user = await authApi.login(email, password);
    setUser(user);
  }

  async function logout() {
    // TODO: try/catch
    await authApi.logout();
    setUser(null);
  }

  setupAxiosInterceptors(logout);

  async function register(name: string, email: string, password: string) {
    try {
      const user = await usersApi.create({ name, email, password });
      setUser(user);

      return null;
    } catch (e) {
      if (isAxiosError(e) && (e.status === 409 || e.status === 400)) {
        return (await e.response?.data) as DetailedStatusError;
      }

      // TODO: what to do here
      throw e;
    }
  }

  onMount(async () => {
    try {
      const me = await usersApi.me();
      setUser(me);
    } catch (_err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used within AuthContext");
  }

  return auth;
};
