import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, For, Suspense } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { gamesApi } from "@/features/games/api";
import type { GameRouteParams } from "@/features/games/types/game";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGroupMembers } from "@/features/groups/hooks/use-group-members";
import { useGame } from "../hooks/use-game";

export const RecordGame = () => {
  const params = useParams<GameRouteParams>();
  const game = useGame(() => params.gameId);

  const group = useGroup();
  const members = useGroupMembers(group);

  const navigate = useNavigate();

  // TODO: defaults
  const [selected, setSelected] = createSignal<(string | undefined)[]>([]);
  const [points, setPoints] = createSignal<(string | undefined)[]>([]);

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

    // TODO: try/catch
    await gamesApi.game(g.id).createMatch({ scores });
    navigate("..");
  };

  return (
    <FormPage title="Record Match" onSubmit={handleSubmit}>
      <Suspense
        fallback={
          <div class="inline-flex h-[1em] w-64 animate-pulse rounded-md bg-gray-200" />
        }
      >
        <p>
          Recording game for <b>{game.data?.name}</b>
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
