import { useNavigate, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { useGame } from "@/features/games/hooks/use-game";
import { useGroup } from "@/features/groups/context/group-provider";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { SCORING_METRIC_LABELS } from "../constants";
import { useDeleteGame } from "../hooks/use-delete-game";
import { useUpdateGame } from "../hooks/use-update-game";
import { type Game, scoringMetrics, updateGameSchema } from "../types/game";

type Props = {
  initialData: Game;
};

// TODO: reduce duplication with create?
const EditGameForm: Component<Props> = (props) => {
  const navigate = useNavigate();
  const group = useGroup();

  const deleteGame = useDeleteGame(group.groupId);
  const updateGame = useUpdateGame();
  const toast = useToast();

  const { values, errors, setField, validate } = useZodForm(updateGameSchema, {
    name: props.initialData.name,
    players_per_match: props.initialData.players_per_match.toString(),
    metric: props.initialData.metric,
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    updateGame.mutate(
      { groupId: props.initialData.id, payload: validData },
      {
        onSuccess: () => {
          toast.success({
            title: "Game updated",
            description: "Game updated successfully",
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
      deleteGame.mutate(props.initialData.id, {
        onSuccess: () => {
          toast.success({
            title: "Game deleted",
            description: "Game deleted successfully",
          });

          navigate("/");
        },
      });
    }
  };

  return (
    <FormPage
      title="Edit Game"
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
        value={values.name}
        onChange={(val) => setField("name", val)}
        placeholder="e.g. Mario Kart Wii"
        error={errors.name}
      />

      {/* TODO: tooltips to explain these inputs */}
      <Input
        label="Number of players per match"
        value={values.players_per_match}
        onChange={(val) => setField("players_per_match", val)}
        placeholder="e.g. 4"
        error={errors.players_per_match}
      />

      <Dropdown
        label="Scoring metric"
        value={values.metric}
        onChange={(val) => setField("metric", val)}
        options={scoringMetrics.map((m) => ({
          label: SCORING_METRIC_LABELS[m],
          value: m,
        }))}
        error={errors.metric}
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

export const EditGame = () => {
  const params = useParams();
  const game = useGame(() => params.gameId);

  // TODO: better loading state
  return (
    <Show when={game.data} fallback={<p>Loading game details...</p>}>
      {(data) => <EditGameForm initialData={data()} />}
    </Show>
  );
};
