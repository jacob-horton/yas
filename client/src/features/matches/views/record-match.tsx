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

  const initialScores = Array.from({
    length: props.game.players_per_match,
  }).map((_, i) => ({
    // Load players from last match, or fall back to first n players
    user_id:
      props.history.length > 0
        ? props.history[i]
        : (props.members[i]?.id ?? ""),
    score: "",
  }));

  const { values, errors, setField, validate } = useZodForm(createMatchSchema, {
    scores: initialScores,
  });

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

  return (
    <FormPage title="Record Match" onSubmit={handleSubmit}>
      <p>
        Recording match for <b>{props.game.name}</b>
      </p>

      <For each={values.scores}>
        {(row, i) => (
          <div class="flex gap-4">
            <Dropdown
              class="w-full flex-1 sm:min-w-64"
              value={row.user_id}
              onChange={(val) => setField("scores", i(), "user_id", val)}
              error={errors[`scores.${i()}.user_id`]}
              options={props.members.map((m) => ({
                label: m.name,
                value: m.id,
                disabled:
                  values.scores.some((s) => s?.user_id === m.id) &&
                  m.id !== row.user_id,
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
          </div>
        )}
      </For>

      <span class="flex gap-4">
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
      </span>
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
