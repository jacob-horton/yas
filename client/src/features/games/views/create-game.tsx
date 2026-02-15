import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { groupsApi } from "@/features/groups/api";
import { useGroup } from "@/features/groups/context/group-provider";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { SCORING_METRIC_LABELS } from "../constants";
import {
  type CreateGameRequest,
  type ScoringMetric,
  scoringMetrics,
} from "../types/game";

export const CreateGame = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const group = useGroup();

  const [name, setName] = createSignal("");
  const [numPlayers, setNumPlayers] = createSignal("");
  const [metric, setMetric] = createSignal<ScoringMetric>(scoringMetrics[0]);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const game: CreateGameRequest = {
      name: name(),
      players_per_match: Number.parseInt(numPlayers(), 10),
      metric: metric(),
    };

    const res = await groupsApi.group(group.groupId()).createGame(game);
    queryClient.invalidateQueries({
      queryKey: groupKeys.games(group.groupId()),
    });
    navigate(`/groups/${group.groupId()}/games/${res.id}`);
  }

  return (
    <FormPage title="Create Game" onSubmit={handleSubmit}>
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
        <Button type="submit">Create</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </span>
    </FormPage>
  );
};
