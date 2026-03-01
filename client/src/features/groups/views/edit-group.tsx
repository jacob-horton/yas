import { useNavigate } from "@solidjs/router";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { useGroup } from "@/features/groups/context/group-provider";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useDeleteGroup } from "../hooks/use-delete-group";
import { useUpdateGroup } from "../hooks/use-update-group";
import { type Group, updateGroupSchema } from "../types";

type Props = {
  initialData: Group;
};

// TODO: reduce duplication with create?
const EditGroupForm: Component<Props> = (props) => {
  const navigate = useNavigate();

  const deleteGroup = useDeleteGroup();
  const updateGroup = useUpdateGroup();
  const toast = useToast();

  const { values, errors, setField, validate } = useZodForm(updateGroupSchema, {
    name: props.initialData.name,
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    updateGroup.mutate(
      { groupId: props.initialData.id, payload: validData },
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
          icon: "delete",
          onAction: handleDelete,
          variant: "secondary",
          danger: true,
        },
      ]}
    >
      <Input
        label="Name"
        value={values.name}
        onChange={(val) => setField("name", val)}
        placeholder="e.g. Family"
        error={errors.name}
      />

      <span class="flex gap-4">
        <Button type="submit" loading={updateGroup.isPending}>
          Update
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          loading={updateGroup.isPending}
        >
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
