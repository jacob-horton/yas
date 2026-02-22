import { useNavigate } from "@solidjs/router";
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { useGroup } from "@/features/groups/context/group-provider";
import { useDeleteGroup } from "../hooks/use-delete-group";
import { useUpdateGroup } from "../hooks/use-update-group";
import type { Group, UpdateGroupRequest } from "../types";

type Props = {
  initialData: Group;
};

// TODO: reduce duplication with create?
const EditGroupForm: Component<Props> = (props) => {
  const navigate = useNavigate();

  const deleteGroup = useDeleteGroup();
  const updateGroup = useUpdateGroup();
  const toast = useToast();

  const [name, setName] = createSignal(props.initialData.name ?? "");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const payload: UpdateGroupRequest = {
      name: name(),
    };

    updateGroup.mutate(
      { groupId: props.initialData.id, payload },
      {
        onSuccess: () => {
          toast.success({
            title: "Group updated",
            description: "Group updated successfully",
          });

          navigate(-1);
        },
      },
    );
  }

  const { showConfirm } = useConfirmation();
  const handleDelete = async () => {
    const isConfirmed = await showConfirm({
      title: "Delete Group",
      description: (
        <p>
          Are you sure you would like to delete{" "}
          <strong>{props.initialData.name}</strong>? This cannot be undone.
        </p>
      ),
      confirmText: "Delete",
      danger: true,
    });

    if (isConfirmed) {
      deleteGroup.mutate(props.initialData.id, {
        onSuccess: () => {
          toast.success({
            title: "Group deleted",
            description: "Group deleted successfully",
          });

          navigate("/");
        },
      });
    }
  };

  return (
    <FormPage
      title="Edit Group"
      onSubmit={handleSubmit}
      actions={[
        {
          text: "Delete",
          onAction: handleDelete,
          variant: "secondary",
          danger: true,
        },
      ]}
    >
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
