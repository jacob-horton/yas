import { useNavigate } from '@solidjs/router';
import { createEffect, type Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useAuth } from '../auth/auth-provider';
import { Button } from '../components/button';
import { Input } from '../components/input';

export const Register: Component = () => {
  const [data, setData] = createStore({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = createStore<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const navigate = useNavigate();
  const auth = useAuth()!;

  createEffect(() => {
    if (auth.user()) {
      navigate('/', { replace: true });
    }
  });

  const register = async (e: SubmitEvent) => {
    e.preventDefault();

    setErrors({});

    if (data.password !== data.confirmPassword) {
      setErrors('confirmPassword', "Password doesn't match");
      return;
    }

    // TODO: check type of error here
    if (!(await auth.register(data.name, data.email, data.password))) {
      setErrors('email', 'Email address already in use');
    }
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="flex flex-col justify-center gap-10 px-32">
        <h1 class="text-3xl font-semibold">Register</h1>
        <form onSubmit={register} class="flex flex-col gap-4">
          <Input
            label="Name"
            value={data.name}
            onChange={(value) => setData('name', value)}
            placeholder="User"
          />
          <Input
            label="Email address"
            error={errors.email}
            value={data.email}
            onChange={(value) => setData('email', value)}
            placeholder="user@email.com"
          />
          <Input
            label="Password"
            type="password"
            value={data.password}
            onChange={(value) => setData('password', value)}
            placeholder="●●●●●●●●●●●●"
          />
          <Input
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword}
            value={data.confirmPassword}
            onChange={(value) => {
              setErrors(
                'confirmPassword',
                value !== data.password ? "Password doesn't match" : ''
              );
              setData('confirmPassword', value);
            }}
            placeholder="●●●●●●●●●●●●"
          />
          <span class="flex gap-4">
            <Button type="submit">Register</Button>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Login
            </Button>
          </span>
        </form>
      </div>
      <div class="aurora-gradient flex w-full items-center justify-center px-16 text-9xl font-semibold text-white">
        Welcome!
      </div>
    </main>
  );
};
