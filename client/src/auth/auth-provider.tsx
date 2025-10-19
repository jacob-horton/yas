import { isAxiosError } from 'axios';
import {
  type Accessor,
  createContext,
  createSignal,
  onMount,
  type ParentComponent,
  useContext,
} from 'solid-js';
import { api, setupAxiosInterceptors } from '../api';

type DetailedStatusError = {
  message: string;
  details: ErrorDetail[];
};

type ErrorDetail = {
  property: string;
  codes: string;
};

const AuthContext = createContext<{
  user: Accessor<string | null>;
  loading: Accessor<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<DetailedStatusError | null>;
}>();

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);

  async function login(email: string, password: string) {
    try {
      await api.post('/auth/login', {
        email,
        password,
      });

      const res = await api.get('/me');
      setUser(res.data);
    } catch {
      // TODO: check axios error
    }
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  setupAxiosInterceptors(logout);

  async function register(name: string, email: string, password: string) {
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      });

      const res = await api.get('/me');
      setUser(res.data);

      return null;
    } catch (e) {
      if (isAxiosError(e) && (e.status === 409 || e.status === 400)) {
        return (await e.response?.data) as DetailedStatusError;
      }

      console.log('throwing');
      // TODO: what to do here
      throw e;
    }
  }

  onMount(async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
    } catch {
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

export const useAuth = () => useContext(AuthContext);
