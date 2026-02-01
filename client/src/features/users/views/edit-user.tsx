import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/auth-provider";
import { usersApi } from "../api";

export const EditUser = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [name, setName] = createSignal(auth.user()?.name ?? "");
  const [email, setEmail] = createSignal(auth.user()?.email ?? "");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    await usersApi.updateMe(name(), email());
    await auth.revalidate();
    navigate("/");
  };

  return (
    <FormPage title="Edit User" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={name()}
        onChange={setName}
        placeholder="User"
      />
      <Input
        label="Email"
        value={email()}
        onChange={setEmail}
        placeholder="user@email.com"
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
