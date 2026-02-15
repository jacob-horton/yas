import { useNavigate, useParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGame } from "@/features/matches/hooks/use-game";
import { gamesApi } from "../api";
import { QK_GAME, SCORING_METRIC_LABELS } from "../constants";
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const _group = useGroup();

  const [name, setName] = createSignal(props.initialData.name ?? "");
  const [numPlayers, setNumPlayers] = createSignal(
    props.initialData.players_per_match.toString() ?? "",
  );
  const [metric, setMetric] = createSignal<ScoringMetric>(
    props.initialData.metric ?? scoringMetrics[0],
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const updateGame: UpdateGameRequest = {
      name: name(),
      players_per_match: Number.parseInt(numPlayers(), 10),
      metric: metric(),
    };

    await gamesApi.game(props.initialData.id).update(updateGame);
    queryClient.invalidateQueries({
      queryKey: [QK_GAME, props.initialData.id],
    });
    navigate(-1);
  }

  return (
    <FormPage title="Edit Game" onSubmit={handleSubmit}>
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
