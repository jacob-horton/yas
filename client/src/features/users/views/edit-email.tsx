import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { type Component, createSignal, Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/auth-provider";
import { usersApi } from "../api";
import { userKeys } from "../hooks/query-keys";

type Props = {
  initialEmail: string;
};

const EditEmailForm: Component<Props> = (props) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [email, setEmail] = createSignal(props.initialEmail);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    await usersApi.updateMyEmail(email());
    await queryClient.invalidateQueries({ queryKey: userKeys.me() });

    navigate(-1);
  };

  return (
    <FormPage title="Change Email" onSubmit={handleSubmit}>
      <Input type="email" label="Email" value={email()} onChange={setEmail} />

      <div class="flex gap-4">
        <Button type="submit">Save</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </FormPage>
  );
};

export const EditEmail: Component = () => {
  const auth = useAuth();

  // TODO: better loading state
  return (
    <Show when={auth.user()} fallback={<p>Loading user details...</p>}>
      {(data) => <EditEmailForm initialEmail={data().email} />}
    </Show>
  );
};
