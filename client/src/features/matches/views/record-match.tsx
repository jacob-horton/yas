import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Suspense } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useLastPlayers } from "@/features/games/hooks/use-last-players";
import type { GameRouteParams } from "@/features/games/types/game";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGroupMembers } from "@/features/groups/hooks/use-group-members";
import { useGame } from "../hooks/use-game";
import { useToast } from "@/context/toast-context";
import { useRecordMatch } from "../hooks/use-record-match";

export const RecordMatch = () => {
  const params = useParams<GameRouteParams>();
  const game = useGame(() => params.gameId);

  const group = useGroup();
  const members = useGroupMembers(group.groupId);

  const navigate = useNavigate();

  const toast = useToast();
  const recordMatch = useRecordMatch();

  const [selected, setSelected] = createSignal<(string | undefined)[]>([]);
  const [points, setPoints] = createSignal<(string | undefined)[]>([]);

  // Set selected players based on last game
  const lastPlayers = useLastPlayers(() => params.gameId);
  createEffect(() => {
    const g = game.data;
    const m = members.data;
    const history = lastPlayers.data;

    if (!g || !m || lastPlayers.isLoading || !history) return;
    if (selected()[0] !== undefined) return;

    const size = g.players_per_match;
    setPoints(new Array(size).fill(0));

    if (history.length > 0) {
      setSelected(history);
    } else {
      const defaults = m.slice(0, size).map((member) => member.id);
      setSelected(defaults);
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // TODO: proper error
    const g = game.data;
    if (!g) {
      return;
    }

    const p = points();
    const scores = selected().map((x, i) => ({
      // biome-ignore lint/style/noNonNullAssertion: TODO: zod validation
      user_id: x!,
      score: parseInt(p[i] ?? "0", 10),
    }));

    recordMatch.mutate(
      { gameId: g.id, payload: { scores } },
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
      <Suspense
        fallback={
          <div class="inline-flex h-[1em] w-64 animate-pulse rounded-md bg-gray-200" />
        }
      >
        <p>
          Recording match for <b>{game.data?.name}</b>
        </p>
      </Suspense>
      <Suspense>
        <For each={Array.from(Array(game.data?.players_per_match).keys())}>
          {(i) => (
            <div class="flex gap-4">
              <Dropdown
                class="flex-1"
                value={selected()[i] ?? ""}
                onChange={(value) =>
                  setSelected((prev) => {
                    const next = [...prev];
                    next[i] = value;
                    return next;
                  })
                }
                options={
                  members.data?.map((m) => ({
                    label: m.name,
                    value: m.id,
                    disabled:
                      selected().includes(m.id) && m.id !== selected()[i],
                  })) ?? []
                }
                label={`Player ${i + 1}`}
              />
              <Input
                class="w-32"
                type="number"
                value={points()[i] ?? ""}
                onChange={(value) => {
                  setPoints((prev) => {
                    const next = [...prev];
                    next[i] = value;
                    return next;
                  });
                }}
                label="Points"
              />
            </div>
          )}
        </For>
      </Suspense>
      <Button type="submit" disabled={game.isLoading}>
        Submit
      </Button>
    </FormPage>
  );
};
