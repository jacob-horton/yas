import { useNavigate } from "@solidjs/router";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useGroup } from "@/features/groups/context/group-provider";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useCreateInvite } from "../hooks/use-create-invite";
import { createInviteSchema } from "../types/invite";

export const CreateInvite = () => {
  const group = useGroup();
  const navigate = useNavigate();

  const { values, errors, setField, validate } = useZodForm(
    createInviteSchema,
    {
      name: "",
      expires_at: "",
      max_uses: "",
    },
  );

  const toast = useToast();
  const createInvite = useCreateInvite();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    createInvite.mutate(
      { groupId: group.groupId(), payload: validData },
      {
        onSuccess: () => {
          toast.success({
            title: "Invite created",
            description: "Invite created successfully",
          });

          navigate(-1);
        },
      },
    );
  };

  return (
    <FormPage title="Create Invite" onSubmit={handleSubmit}>
      <Input
        value={values.name}
        onChange={(val) => setField("name", val)}
        label="Name"
        placeholder="e.g. Friends"
        error={errors.name}
      />
      <Input
        inputMode="numeric"
        value={values.max_uses}
        onChange={(val) => setField("max_uses", val)}
        label="Max Uses"
        placeholder="e.g. 10 (leave empty for no limit)"
        error={errors.max_uses}
      />
      <Input
        type="datetime-local"
        value={values.expires_at}
        onChange={(val) => setField("expires_at", val)}
        label="Expires At"
        error={errors.expires_at}
      />

      <span class="flex gap-4">
        <Button type="submit">Create</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </span>
    </FormPage>
  );
};
