import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupsApi } from "../api";
import { groupKeys } from "../hooks/query-keys";

export const CreateGroup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = createSignal("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    // TODO: handle errors
    const res = await groupsApi.create({ name: name() });
    await queryClient.invalidateQueries({ queryKey: groupKeys.all });

    navigate(`/groups/${res.id}`);
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
