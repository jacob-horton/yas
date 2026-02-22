import { useNavigate } from "@solidjs/router";
import { type Component, createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useUpdatePassword } from "../hooks/use-update-password";

export const EditPassword: Component = () => {
  const navigate = useNavigate();

  const toast = useToast();
  const updatePassword = useUpdatePassword();

  const [currentPassword, setCurrentPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [newPasswordConfirm, setNewPasswordConfirm] = createSignal("");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (newPassword() !== newPasswordConfirm()) {
      // TODO: proper error
      console.error("passwords don't match");
      return;
    }

    updatePassword.mutate(
      { currentPassword: currentPassword(), newPassword: newPassword() },
      {
        onSuccess: () => {
          toast.success({
            title: "Password updated",
            description:
              "Password updated successfully. All other devices have been logged out",
          });
          navigate(-1);
        },
      },
    );
  };

  return (
    <FormPage title="Change Password" onSubmit={handleSubmit}>
      <Input
        type="password"
        label="Current password"
        value={currentPassword()}
        onChange={setCurrentPassword}
        placeholder="●●●●●●●●●●●●"
      />
      <Input
        type="password"
        label="New password"
        value={newPassword()}
        onChange={setNewPassword}
        placeholder="●●●●●●●●●●●●"
      />
      <Input
        type="password"
        label="Confirm new password"
        value={newPasswordConfirm()}
        onChange={setNewPasswordConfirm}
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
