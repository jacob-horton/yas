import { useNavigate } from "@solidjs/router";
import { isAxiosError } from "axios";
import { type Component, createEffect } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PreloadLink } from "@/components/ui/preload-link";
import { useToast } from "@/context/toast-context";
import { createUserSchema } from "@/features/users/types";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useAuth } from "../context/auth-provider";
import { useRegister } from "../hooks/use-register";

export const Register: Component = () => {
  const { values, errors, setField, setError, validate } = useZodForm(
    createUserSchema,
    {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  );

  const toast = useToast();
  const register = useRegister();

  const navigate = useNavigate();
  const auth = useAuth();

  createEffect(() => {
    if (!register.isPending && auth.user()) {
      navigate("/", { replace: true });
    }
  });

  const handleRegister = async (e: SubmitEvent) => {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    register.mutate(validData, {
      onError: (e) => {
        if (isAxiosError(e) && e.status === 409) {
          setError("email", "Email already taken");
        }
      },
      onSuccess: () => {
        toast.success({
          title: "Registered",
          description: "Successfully registered!",
        });
      },
    });
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip bg-white dark:bg-gray-900">
      <div class="flex w-full flex-col items-center justify-center gap-8 px-8 sm:px-16 lg:w-[600px] lg:min-w-[600px] lg:gap-10 lg:px-32">
        <h1 class="font-semibold text-3xl">Register</h1>
        <form onSubmit={handleRegister} class="flex flex-col gap-4">
          <Input
            label="Name"
            value={values.name}
            error={errors.name}
            onChange={(value) => setField("name", value)}
            placeholder="User"
          />
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
            value={values.password}
            error={errors.password}
            onChange={(value) => setField("password", value)}
            placeholder="●●●●●●●●●●●●"
          />
          <Input
            label="Confirm Password"
            type="password"
            error={errors.confirm_password}
            value={values.confirm_password}
            onChange={(value) => setField("confirm_password", value)}
            placeholder="●●●●●●●●●●●●"
          />

          <Button
            type="submit"
            class="mt-2 w-full"
            loading={register.isPending}
          >
            Register
          </Button>

          <div class="mt-2 text-center text-sm">
            <span class="text-gray-500">Already have an account? </span>
            <PreloadLink
              href="/login"
              class="font-semibold text-violet-600 hover:underline"
            >
              Log in
            </PreloadLink>
          </div>
        </form>
      </div>

      <div class="aurora-gradient hidden w-full items-center justify-center px-12 text-center font-semibold text-white lg:flex lg:text-6xl xl:text-8xl">
        Welcome!
      </div>
    </main>
  );
};
