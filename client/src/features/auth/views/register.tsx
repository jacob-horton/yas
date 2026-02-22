import { A, useNavigate } from "@solidjs/router";
import { type Component, createEffect } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserSchema } from "@/features/users/types";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useAuth } from "../context/auth-provider";

export const Register: Component = () => {
  const { values, errors, setField, validate } = useZodForm(createUserSchema, {
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const navigate = useNavigate();
  const auth = useAuth();

  createEffect(() => {
    if (auth.user()) {
      navigate("/", { replace: true });
    }
  });

  const register = async (e: SubmitEvent) => {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    // TODO: check type of error here
    await auth.register(values.name, values.email, values.password);
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="flex min-w-[600px] flex-col justify-center gap-10 px-32">
        <h1 class="font-semibold text-3xl">Register</h1>
        <form onSubmit={register} class="flex flex-col gap-4">
          <Input
            label="Name"
            value={values.name}
            error={errors.name}
            onChange={(value) => setField("name", value)}
            placeholder="User"
          />
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

          <Button type="submit" class="w-full">
            Register
          </Button>

          <div class="text-center text-sm">
            <span class="text-gray-500">Already have an account?</span>
            <A
              href="/login"
              class="font-semibold text-violet-600 hover:underline"
            >
              Log in
            </A>
          </div>
        </form>
      </div>
      <div class="aurora-gradient flex flex-1 items-center justify-center px-16 font-semibold text-9xl text-white">
        Welcome!
      </div>
    </main>
  );
};
