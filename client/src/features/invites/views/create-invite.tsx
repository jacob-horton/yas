import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupsApi } from "@/features/groups/api";
import { useGroup } from "@/features/groups/context/group-provider";

export const CreateInvite = () => {
  const group = useGroup();

  const [name, setName] = createSignal("");
  const [expiresAt, setExpiresAt] = createSignal("");
  const [maxUses, setMaxUses] = createSignal("");

  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const rawExpiresAt = expiresAt().trim() || null;
    const expires_at = rawExpiresAt
      ? new Date(rawExpiresAt).toISOString()
      : null;

    const maxUsesStr = maxUses().trim();
    const max_uses = maxUsesStr ? Number.parseInt(maxUsesStr, 10) : null;

    if (max_uses !== null && Number.isNaN(max_uses)) {
      throw new Error("Max uses must be a valid number");
    }

    await groupsApi.group(group.groupId()).createInvite({
      name: name(),
      max_uses,
      expires_at,
    });
    navigate("..");
  };

  return (
    <FormPage title="Create Invite" onSubmit={handleSubmit}>
      <Input
        value={name()}
        onChange={setName}
        label="Name"
        placeholder="e.g. Friends"
      />
      <Input
        type="number"
        value={maxUses()}
        onChange={setMaxUses}
        label="Max Uses"
        placeholder="e.g. 10 (leave empty for no limit)"
      />
      <Input
        type="datetime-local"
        value={expiresAt()}
        onChange={setExpiresAt}
        label="Expires At"
      />

      <span class="flex gap-4">
        <Button type="submit">Create</Button>
        <Button variant="secondary" onClick={() => navigate("..")}>
          Cancel
        </Button>
      </span>
    </FormPage>
  );
};
