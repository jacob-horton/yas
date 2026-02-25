import { useNavigate, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { resetPasswordSchema } from "@/features/users/types";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useResetPassword } from "../hooks/use-reset-password";

export const ResetPassword: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { values, errors, setField, validate } = useZodForm(
    resetPasswordSchema,
    {
      password: "",
      confirm_password: "",
    },
  );

  const toast = useToast();
  const resetPassword = useResetPassword();

  const handleResetPassword = async (e: SubmitEvent) => {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    resetPassword.mutate(
      { token: params.token, password: values.password },
      {
        onSuccess: () => {
          toast.success({
            title: "Password reset",
            description: "Successfully reset password!",
          });

          navigate("/");
        },
      },
    );
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="m-auto flex flex-col items-center gap-6">
        <h1 class="font-semibold text-3xl">Reset Password</h1>
        <form onSubmit={handleResetPassword} class="flex flex-col gap-4">
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
            Reset
          </Button>
        </form>
      </div>
    </main>
  );
};
