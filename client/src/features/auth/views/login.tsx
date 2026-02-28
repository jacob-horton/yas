import { A, useNavigate } from "@solidjs/router";
import { type Component, createEffect } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { loginSchema } from "@/features/users/types";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useAuth } from "../context/auth-provider";
import { useLogin } from "../hooks/use-login";

export const Login: Component = () => {
  const { values, errors, setField, validate } = useZodForm(loginSchema, {
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const auth = useAuth();

  const login = useLogin();
  const toast = useToast();

  createEffect(() => {
    if (!auth.loading && auth.user()) {
      navigate("/", { replace: true });
    }
  });

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    login.mutate(validData, {
      onSuccess: () => {
        toast.success({
          title: "Logged in",
          description: "Successfully logged in!",
        });

        navigate("/", { replace: true });
      },
    });
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="flex min-w-[600px] flex-col justify-center gap-10 px-32">
        <h1 class="font-semibold text-3xl">Login</h1>
        <form onSubmit={handleLogin} class="flex flex-col gap-4">
          <Input
            label="Email address"
            error={errors.email}
            value={values.email}
            onChange={(value) => setField("email", value)}
            placeholder="user@email.com"
          />
          <Input
            label="Password"
            type="password"
            error={errors.password}
            value={values.password}
            onChange={(value) => setField("password", value)}
            placeholder="●●●●●●●●●●●●"
          />

          <Button type="submit" class="w-full">
            Login
          </Button>

          <div class="flex flex-col items-center gap-1 text-center text-sm">
            <span>
              <span class="text-gray-500">Don't have an account? </span>
              <A
                href="/register"
                class="font-semibold text-violet-600 hover:underline"
              >
                Sign up
              </A>
            </span>

            <A
              href="/forgot-password"
              class="text-violet-600 text-xs hover:underline"
            >
              Forgotten password?
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
