import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useCreateGroup } from "../hooks/use-create-group";
import type { CreateGroupRequest } from "../types";

export const CreateGroup = () => {
  const navigate = useNavigate();
  const createGroup = useCreateGroup();
  const toast = useToast();

  const [name, setName] = createSignal("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const payload: CreateGroupRequest = { name: name() };

    createGroup.mutate(payload, {
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
        value={name()}
        onChange={setName}
        placeholder="e.g. Family"
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
