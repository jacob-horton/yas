import { useNavigate } from "@solidjs/router";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useCreateGroup } from "../hooks/use-create-group";
import { createGroupSchema } from "../types";

export const CreateGroup = () => {
  const navigate = useNavigate();
  const createGroup = useCreateGroup();
  const toast = useToast();

  const { values, errors, setField, validate } = useZodForm(createGroupSchema, {
    name: "",
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    createGroup.mutate(validData, {
      onSuccess: (resp) => {
        toast.success({
          title: "Group created",
          description: "Group created successfully",
        });

        navigate(`/groups/${resp.id}`);
      },
    });
  }

  return (
    <FormPage title="Create Group" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={values.name}
        onChange={(val) => setField("name", val)}
        placeholder="e.g. Family"
        error={errors.name}
      />
      <span class="flex gap-4">
        <Button type="submit">Create</Button>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Cancel
        </Button>
      </span>
    </FormPage>
  );
};
