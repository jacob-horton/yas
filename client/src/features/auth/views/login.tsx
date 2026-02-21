import { A, useNavigate } from "@solidjs/router";
import { type Component, createEffect, createSignal } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/auth-provider";

export const Login: Component = () => {
  const [email, setEmail] = createSignal("jacob@email.com");
  const [password, setPassword] = createSignal("password");

  const navigate = useNavigate();
  const auth = useAuth();

  createEffect(() => {
    if (auth.user()) {
      navigate("/", { replace: true });
    }
  });

  const login = async (e: SubmitEvent) => {
    e.preventDefault();
    await auth.login(email(), password());
    navigate("/", { replace: true });
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="flex min-w-[600px] flex-col justify-center gap-10 px-32">
        <h1 class="font-semibold text-3xl">Login</h1>
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

          <Button type="submit" class="w-full">
            Login
          </Button>

          <div class="text-center text-sm">
            <span class="text-gray-500">Don't have an account? </span>
            <A
              href="/register"
              class="font-semibold text-violet-600 hover:underline"
            >
              Sign up
            </A>
          </div>
        </form>
      </div>
      <div class="aurora-gradient flex w-full items-center justify-center px-16 font-semibold text-9xl text-white">
        Welcome Back!
      </div>
    </main>
  );
};
