import { isAxiosError } from "axios";
import {
  type Accessor,
  createContext,
  createSignal,
  onMount,
  type ParentComponent,
  useContext,
} from "solid-js";
import { api, setupAxiosInterceptors } from "../api";

type DetailedStatusError = {
  message: string;
  details: ErrorDetail[];
};

type ErrorDetail = {
  property: string;
  codes: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
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
    try {
      const res = await api.post("/sessions", {
        email,
        password,
      });

      setUser(res.data as User);
    } catch {
      // TODO: check axios error
    }
  }

  async function logout() {
    await api.delete("/sessions");
    setUser(null);
  }

  setupAxiosInterceptors(logout);

  async function register(name: string, email: string, password: string) {
    try {
      const res = await api.post("/users", {
        name,
        email,
        password,
      });

      setUser(res.data);

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
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
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
