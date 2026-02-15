import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGroup } from "@/features/groups/context/group-provider";
import { groupsApi } from "../api";
import { groupKeys } from "../hooks/query-keys";
import type { Group, UpdateGroupRequest } from "../types";

type Props = {
  initialData: Group;
};

// TODO: reduce duplication with create?
const EditGroupForm: Component<Props> = (props) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [name, setName] = createSignal(props.initialData.name ?? "");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const updateGroup: UpdateGroupRequest = {
      name: name(),
    };

    await groupsApi.group(props.initialData.id).update(updateGroup);
    queryClient.invalidateQueries({ queryKey: groupKeys.all });
    navigate(-1);
  }

  return (
    <FormPage title="Edit Group" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={name()}
        onChange={setName}
        placeholder="e.g. Mario Kart Wii"
      />

      <span class="flex gap-4">
        <Button type="submit">Update</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </span>
    </FormPage>
  );
};

export const EditGroup = () => {
  const group = useGroup();

  // TODO: better loading state
  return (
    <Show
      when={group.groupQuery.data}
      fallback={<p>Loading group details...</p>}
    >
      {(data) => <EditGroupForm initialData={data()} />}
    </Show>
  );
};
