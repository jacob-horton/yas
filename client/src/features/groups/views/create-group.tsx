import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupsApi } from "../api";

export const CreateGroup = () => {
  const navigate = useNavigate();

  const [name, setName] = createSignal("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    // TODO: handle errors
    const res = await groupsApi.create({ name: name() });
    navigate(`/groups/${res.id}`);
  }

  return (
    <FormPage title="Create Group" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={name()}
        onChange={setName}
        placeholder="e.g. Mario Kart Wii"
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
