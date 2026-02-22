import { useNavigate } from "@solidjs/router";
import { isAxiosError } from "axios";
import { type Component, Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useUpdateEmail } from "../hooks/use-update-email";
import { updateEmailSchema } from "../types";

type Props = {
  initialEmail: string;
};

const EditEmailForm: Component<Props> = (props) => {
  const navigate = useNavigate();
  const { showConfirm } = useConfirmation();

  const { values, errors, setField, setError, validate } = useZodForm(
    updateEmailSchema,
    {
      email: props.initialEmail,
    },
  );

  const toast = useToast();
  const updateEmail = useUpdateEmail();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const isConfirmed = await showConfirm({
      title: "Change Email",
      description: (
        <div class="flex flex-col gap-2">
          <p>
            Are you sure you would like to change your email to{" "}
            <strong>{values.email}</strong>?
          </p>
          <p class="text-xs">
            Please note: after changing your email, you will need to reverify it
            before you can make any modifications to anything (including
            recording matches){" "}
          </p>
        </div>
      ),
      confirmText: "Change",
    });

    if (!isConfirmed) return;

    const validData = validate();
    if (!validData) return;

    updateEmail.mutate(validData.email, {
      onSuccess: () => {
        toast.success({
          title: "Email updated",
          description: "Email updated successfully",
        });

        navigate(-1);
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 409) {
          setError("email", "Email already taken");
        }
      },
    });
  };

  return (
    <FormPage title="Change Email" onSubmit={handleSubmit}>
      <p class="text-sm">
        Please note: after changing your email, you will need to reverify it
        before you can make any modifications to anything (including recording
        matches)
      </p>

      <Input
        type="email"
        label="Email"
        value={values.email}
        onChange={(val) => setField("email", val)}
        error={errors.email}
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

export const EditEmail: Component = () => {
  const auth = useAuth();

  // TODO: better loading state
  return (
    <Show when={auth.user()} fallback={<p>Loading user details...</p>}>
      {(data) => <EditEmailForm initialEmail={data().email} />}
    </Show>
  );
};
