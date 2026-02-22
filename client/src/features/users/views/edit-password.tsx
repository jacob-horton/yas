import { useNavigate } from "@solidjs/router";
import type { Component } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useUpdatePassword } from "../hooks/use-update-password";
import { updatePasswordSchema } from "../types";

export const EditPassword: Component = () => {
  const navigate = useNavigate();

  const toast = useToast();
  const updatePassword = useUpdatePassword();

  const { values, errors, setField, validate } = useZodForm(
    updatePasswordSchema,
    {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  );

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    updatePassword.mutate(validData, {
      onSuccess: () => {
        toast.success({
          title: "Password updated",
          description:
            "Password updated successfully. All other devices have been logged out",
        });
        navigate(-1);
      },
    });
  };

  return (
    <FormPage title="Change Password" onSubmit={handleSubmit}>
      <Input
        type="password"
        label="Current password"
        value={values.current_password}
        onChange={(val) => setField("current_password", val)}
        error={errors.current_password}
        placeholder="●●●●●●●●●●●●"
      />
      <Input
        type="password"
        label="New password"
        value={values.new_password}
        onChange={(val) => setField("new_password", val)}
        error={errors.new_password}
        placeholder="●●●●●●●●●●●●"
      />
      <Input
        type="password"
        label="Confirm new password"
        value={values.confirm_new_password}
        onChange={(val) => setField("confirm_new_password", val)}
        error={errors.confirm_new_password}
        placeholder="●●●●●●●●●●●●"
      />

      <div class="flex gap-4">
        <Button type="submit">Save</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </FormPage>
  );
};
