import { A, useNavigate } from "@solidjs/router";
import ArrowLeftIcon from "lucide-solid/icons/arrow-left";
import { type Component, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/auth-provider";

const ERROR_MESSAGES = {
  length: "Invalid length",
  email: "Must be a valid email",
  common: "Password is too common",
  duplicate: "Already in use",
};

export const Register: Component = () => {
  const [data, setData] = createStore({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = createStore<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const navigate = useNavigate();
  const auth = useAuth();

  createEffect(() => {
    if (auth.user()) {
      navigate("/", { replace: true });
    }
  });

  const register = async (e: SubmitEvent) => {
    e.preventDefault();

    setErrors("name", undefined);
    setErrors("email", undefined);
    setErrors("password", undefined);
    setErrors("confirmPassword", undefined);

    if (data.password !== data.confirmPassword) {
      setErrors("confirmPassword", "Password doesn't match");
      return;
    }

    // TODO: check type of error here
    const errorDetails = await auth.register(
      data.name,
      data.email,
      data.password,
    );
    if (errorDetails) {
      for (const detail of errorDetails.details) {
        setErrors(
          detail.property as "name" | "email" | "password" | "confirmPassword",
          ERROR_MESSAGES[detail.codes[0] as keyof typeof ERROR_MESSAGES],
        );
      }
    }
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="flex min-w-[600px] flex-col justify-center gap-10 px-32">
        <h1 class="font-semibold text-3xl">Register</h1>
        <form onSubmit={register} class="flex flex-col gap-4">
          <Input
            label="Name"
            value={data.name}
            error={errors.name}
            onChange={(value) => setData("name", value)}
            placeholder="User"
          />
          <Input
            label="Email address"
            error={errors.email}
            value={data.email}
            onChange={(value) => setData("email", value)}
            placeholder="user@email.com"
          />
          <Input
            label="Password"
            type="password"
            value={data.password}
            error={errors.password}
            onChange={(value) => setData("password", value)}
            placeholder="●●●●●●●●●●●●"
          />
          <Input
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword}
            value={data.confirmPassword}
            onChange={(value) => {
              setErrors(
                "confirmPassword",
                value !== data.password ? "Password doesn't match" : "",
              );
              setData("confirmPassword", value);
            }}
            placeholder="●●●●●●●●●●●●"
          />

          <Button type="submit" class="w-full">
            Register
          </Button>

          <div class="text-center text-sm">
            <span class="text-gray-500">Already have an account? </span>
            <A
              href="/login"
              class="font-medium text-violet-600 hover:underline"
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
