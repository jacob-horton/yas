import { useNavigate } from "@solidjs/router";
import { type Component, createEffect } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PreloadLink } from "@/components/ui/preload-link";
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
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip bg-white dark:bg-gray-900">
      <div class="flex w-full flex-col items-center justify-center gap-8 px-8 sm:px-16 lg:w-[600px] lg:min-w-[600px] lg:gap-10 lg:px-32">
        <h1 class="font-semibold text-3xl">Login</h1>
        <form onSubmit={handleLogin} class="flex flex-col gap-4">
          <Input
            label="Email Address"
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

          <Button type="submit" class="w-full" loading={login.isPending}>
            Login
          </Button>

          <div class="mt-4 flex flex-col items-center gap-2 text-center text-sm">
            <span>
              <span class="text-gray-500">Don't have an account? </span>
              <PreloadLink
                href="/register"
                class="font-semibold text-violet-600 hover:underline"
              >
                Sign up
              </PreloadLink>
            </span>

            <PreloadLink
              href="/forgot-password"
              class="text-violet-600 text-xs hover:underline"
            >
              Forgotten password?
            </PreloadLink>
          </div>
        </form>
      </div>

      <div class="aurora-gradient hidden w-full items-center justify-center px-12 text-center font-semibold text-white lg:flex lg:text-6xl xl:text-8xl">
        Welcome Back!
      </div>
    </main>
  );
};
