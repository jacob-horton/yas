import { useNavigate } from "@solidjs/router";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { useToast } from "@/context/toast-context";
import { useGroup } from "@/features/groups/context/group-provider";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useCreateInvite } from "../hooks/use-create-invite";
import { createInviteSchema } from "../types/invite";

const isEmail = (val: string) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);

export const CreateInvite = () => {
  const group = useGroup();
  const navigate = useNavigate();

  const { values, errors, setField, validate } = useZodForm(
    createInviteSchema,
    {
      name: "",
      expires_at: undefined,
      max_uses: "",
      email_whitelist: [],
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

      <DatePicker
        label="Expires At"
        tooltip="Defaults to 1 month in the future if not provided"
        value={values.expires_at ?? undefined}
        onChange={(val) => setField("expires_at", val)}
        error={errors.expires_at}
      />

      <TagInput
        label="Whitelisted Emails"
        tooltip="If provided, only people with these emails can use the invite. If none are provided, it will work for all emails"
        placeholder="Enter emails or paste a list..."
        value={values.email_whitelist}
        onChange={(val) => setField("email_whitelist", val)}
        error={errors.email_whitelist}
        validate={isEmail}
      />

      <span class="flex gap-4">
        <Button type="submit" loading={createInvite.isPending}>
          Create
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          loading={createInvite.isPending}
        >
          Cancel
        </Button>
      </span>
    </FormPage>
  );
};
