import { useNavigate } from '@solidjs/router';
import { createEffect, createSignal, type Component } from 'solid-js';
import { useAuth } from '../auth/auth-provider';
import { Button } from '../components/button';
import { Input } from '../components/input';

export const Login: Component = () => {
  const [email, setEmail] = createSignal('hortonjacob1@gmail.com');
  const [password, setPassword] = createSignal('passw0rd');

  const navigate = useNavigate();
  const auth = useAuth()!;

  createEffect(() => {
    if (auth.user()) {
      navigate('/', { replace: true });
    }
  });

  const login = async (e: SubmitEvent) => {
    e.preventDefault();
    auth.login(email(), password());
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="flex flex-col justify-center gap-10 px-32">
        <h1 class="text-3xl font-semibold">Login</h1>
        <form onSubmit={login} class="flex flex-col gap-4">
          <Input
            label="Email address"
            value={email()}
            onChange={setEmail}
            placeholder="user@email.com"
          />
          <Input
            label="Password"
            type="password"
            value={password()}
            onChange={setPassword}
            placeholder="●●●●●●●●●●●●"
          />
          <span class="flex gap-4">
            <Button type="submit">Login</Button>
            <Button variant="secondary" onClick={() => navigate('/register')}>
              Register
            </Button>
          </span>
        </form>
      </div>
      <div class="aurora-gradient flex w-full items-center justify-center px-16 text-9xl font-semibold text-white">
        Welcome Back!
      </div>
    </main>
  );
};
