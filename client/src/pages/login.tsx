import type { Component } from 'solid-js';
import { Button } from '../components/button';
import { Input } from '../components/input';

export const Login: Component = () => {
  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="flex flex-col justify-center gap-4 px-32">
        <h1 class="mb-6 text-3xl font-semibold">Login</h1>
        <Input label="Email address" />
        <Input label="Password" type="password" />
        <span class="flex gap-4">
          <Button>Login</Button>
          <Button variant="secondary">Sign up</Button>
        </span>
      </div>
      <div class="aurora-gradient flex w-full items-center justify-center px-8 text-8xl font-semibold text-white">
        Welcome Back!
      </div>
    </main>
  );
};
