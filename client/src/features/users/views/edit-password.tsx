import { useNavigate } from "@solidjs/router";
import { type Component, createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usersApi } from "../api";

export const EditPassword: Component = () => {
  const navigate = useNavigate();

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

    await usersApi.updateMyPassword(currentPassword(), newPassword());
    navigate(-1);
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
