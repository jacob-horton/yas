import {
  type Accessor,
  createContext,
  createSignal,
  onMount,
  type ParentComponent,
  useContext,
} from 'solid-js';
import { api, setupAxiosInterceptors } from '../api';

const AuthContext = createContext<{
  user: Accessor<string | null>;
  loading: Accessor<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}>();

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);

  async function login(email: string, password: string) {
    try {
      await api.post(
        '/auth/login',
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
