import { useNavigate, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGame } from "@/features/games/hooks/use-game";
import { SCORING_METRIC_LABELS } from "../constants";
import { useDeleteGame } from "../hooks/use-delete-game";
import { useUpdateGame } from "../hooks/use-update-game";
import {
  type Game,
  type ScoringMetric,
  scoringMetrics,
  type UpdateGameRequest,
} from "../types/game";

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

  const [name, setName] = createSignal(props.initialData.name ?? "");
  const [numPlayers, setNumPlayers] = createSignal(
    props.initialData.players_per_match.toString() ?? "",
  );
  const [metric, setMetric] = createSignal<ScoringMetric>(
    props.initialData.metric ?? scoringMetrics[0],
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const payload: UpdateGameRequest = {
      name: name(),
      players_per_match: Number.parseInt(numPlayers(), 10),
      metric: metric(),
    };

    updateGame.mutate(
      { groupId: props.initialData.id, payload },
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
        value={name()}
        onChange={setName}
        placeholder="e.g. Mario Kart Wii"
      />

      {/* TODO: tooltips to explain these inputs */}
      <Input
        label="Number of players per match"
        value={numPlayers()}
        onChange={setNumPlayers}
        placeholder="e.g. 4"
      />

      <Dropdown
        label="Scoring metric"
        value={metric()}
        onChange={setMetric}
        options={scoringMetrics.map((m) => ({
          label: SCORING_METRIC_LABELS[m],
          value: m,
        }))}
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
