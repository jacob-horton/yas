import { useNavigate, useSubmission } from "@solidjs/router";
import { createSignal } from "solid-js";
import { Page } from "@/components/layout/page";
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
    <Page title="Create Group">
      <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          label="Name"
          value={name()}
          onChange={setName}
          placeholder="e.g. Mario Kart Wii"
        />
        <span class="flex gap-4">
          <Button type="submit">Create</Button>
          <Button variant="secondary" onClick={() => navigate("..")}>
            Cancel
          </Button>
        </span>
      </form>
    </Page>
  );
};
