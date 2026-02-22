import { useNavigate } from "@solidjs/router";
import { type Component, createSignal, Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useUpdateEmail } from "../hooks/use-update-email";

type Props = {
  initialEmail: string;
};

const EditEmailForm: Component<Props> = (props) => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal(props.initialEmail);

  const toast = useToast();
  const updateEmail = useUpdateEmail();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    updateEmail.mutate(email(), {
      onSuccess: () => {
        toast.success({
          title: "Email updated",
          description: "Email updated successfully",
        });

        navigate(-1);
      },
    });
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
