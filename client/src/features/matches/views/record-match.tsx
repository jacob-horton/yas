import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { gamesApi } from "@/features/games/api";
import type { GameRouteParams } from "@/features/games/types";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGame } from "../hooks/use-game";
import { useMembers } from "../hooks/use-members";

export const RecordGame = () => {
  const params = useParams<GameRouteParams>();
  const game = useGame(() => params.gameId);

  const group = useGroup();
  const members = useMembers(group);

  const navigate = useNavigate();

  // TODO: defaults
  const [selected, setSelected] = createSignal<(string | undefined)[]>([]);
  const [points, setPoints] = createSignal<(string | undefined)[]>([]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // TODO: proper error
    const g = game();
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
    <Page title="Record Game">
      <Suspense>
        <p>
          Recording game for <b>{game()?.name}</b>
        </p>
        <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
          <For each={Array.from(Array(game()?.players_per_match).keys())}>
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
                    members()?.map((m) => ({
                      label: m.name,
                      value: m.id.toString(),
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
          <Button type="submit">Submit</Button>
        </form>
      </Suspense>
    </Page>
  );
};
