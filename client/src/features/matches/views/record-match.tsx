import { useNavigate, useParams } from "@solidjs/router";
import { For, Show } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useGame } from "@/features/games/hooks/use-game";
import { useLastPlayers } from "@/features/games/hooks/use-last-players";
import type { Game, GameRouteParams } from "@/features/games/types/game";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGroupMembers } from "@/features/groups/hooks/use-group-members";
import type { GroupMember } from "@/features/groups/types";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { useRecordMatch } from "../hooks/use-record-match";
import { createMatchSchema } from "../types";

export const RecordMatchForm = (props: {
  game: Game;
  members: GroupMember[];
  history: string[];
}) => {
  const toast = useToast();
  const recordMatch = useRecordMatch();
  const navigate = useNavigate();

  // Load history, but ensure we are between the min and max requirements
  const getInitialScores = () => {
    const min = props.game.min_players_per_match;
    const max = props.game.max_players_per_match;

    // Initial number of players is the number from the previous match, capped between min and max players
    const rowCount = Math.min(Math.max(props.history.length, min), max);

    return Array.from({ length: rowCount }).map((_, i) => ({
      user_id: props.history[i] ?? "", // Fallback to empty if history is shorter than min
      score: "",
    }));
  };

  const { values, errors, setField, validate, clearErrors } = useZodForm(
    createMatchSchema(
      props.game.min_players_per_match,
      props.game.max_players_per_match,
    ),
    { scores: getInitialScores() },
  );

  const addPlayer = () => {
    if (values.scores.length < props.game.max_players_per_match) {
      setField("scores", (s) => [...s, { user_id: "", score: "" }]);
      clearErrors();
    }
  };

  const removePlayer = (index: number) => {
    if (values.scores.length > props.game.min_players_per_match) {
      setField("scores", (s) => s.filter((_, i) => i !== index));
      clearErrors();
    } else {
      toast.error({
        title: "Cannot remove player",
        description: `This game requires at least ${props.game.min_players_per_match} players.`,
      });
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const validData = validate();
    if (!validData) return;

    recordMatch.mutate(
      { gameId: props.game.id, payload: { scores: validData.scores } },
      {
        onSuccess: () => {
          toast.success({
            title: "Match recorded",
            description: "Match recorded successfully",
          });
          navigate(-1);
        },
      },
    );
  };

  const handlePlayerSelected = (playerId: string, dropdownIdx: number) => {
    // Check if player already selected in another dropdown
    const existingRowIndex = values.scores.findIndex(
      (s, idx) => s?.user_id === playerId && idx !== dropdownIdx,
    );

    // Player not already selected in another dropdown - set the value of this dropdown normally
    if (existingRowIndex === -1) {
      setField("scores", dropdownIdx, "user_id", playerId);
      return;
    }

    // Otherwise, we need to swap this value with the other dropdown
    const currentPlayerId = values.scores[dropdownIdx].user_id;
    setField("scores", existingRowIndex, "user_id", currentPlayerId);
    setField("scores", dropdownIdx, "user_id", playerId);

    toast.success({
      title: "Players swapped",
      description: "Swapped positions to avoid duplicates",
    });
  };

  return (
    <FormPage title="Record Match" onSubmit={handleSubmit}>
      <header>
        <p>
          Recording match for <b>{props.game.name}</b>
        </p>
      </header>

      <For each={values.scores}>
        {(row, i) => (
          <div class="flex gap-4">
            <Dropdown
              class="w-full flex-1 sm:min-w-64"
              value={row.user_id}
              onChange={(playerId) => handlePlayerSelected(playerId, i())}
              error={errors[`scores.${i()}.user_id`]}
              options={props.members.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
              label={`Player ${i() + 1}`}
            />

            <Input
              class="w-24 min-w-24 max-w-24 sm:w-32 sm:min-w-32 sm:max-w-32"
              inputMode="numeric"
              value={row.score}
              onChange={(val) => setField("scores", i(), "score", val)}
              error={errors[`scores.${i()}.score`]}
              label="Points"
              placeholder="e.g. 50"
            />

            <Show
              when={
                props.game.max_players_per_match >
                props.game.min_players_per_match
              }
            >
              <div class="flex h-16 items-center">
                <Button
                  variant="ghost"
                  icon="delete"
                  onClick={() => removePlayer(i())}
                  disabled={
                    values.scores.length <= props.game.min_players_per_match
                  }
                  aria-label="Remove player"
                  danger
                />
              </div>
            </Show>
          </div>
        )}
      </For>

      <Show when={values.scores.length < props.game.max_players_per_match}>
        <Button variant="ghost" onClick={addPlayer}>
          + Add Player
        </Button>
      </Show>

      <div class="flex gap-4">
        <Button type="submit" loading={recordMatch.isPending}>
          Submit
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          loading={recordMatch.isPending}
        >
          Cancel
        </Button>
      </div>
    </FormPage>
  );
};

export const RecordMatch = () => {
  const params = useParams<GameRouteParams>();
  const game = useGame(() => params.gameId);

  const group = useGroup();
  const members = useGroupMembers(group.groupId);

  const lastPlayers = useLastPlayers(() => params.gameId);

  return (
    <Show
      when={!lastPlayers.isLoading && !members.isLoading && !game.isLoading}
    >
      <RecordMatchForm
        game={game.data!}
        members={members.data!}
        history={lastPlayers.data!}
      />
    </Show>
  );
};
