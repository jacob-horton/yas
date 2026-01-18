import { createAsync, query, useNavigate, useParams } from "@solidjs/router";
import { createSignal, For, Suspense } from "solid-js";
import { api } from "../api";
import type { User } from "../auth/auth-provider";
import { Dropdown } from "../components/dropdown";
import { Page } from "../components/page";
import { useGroup } from "../group-provider";
import { Input } from "../components/input";
import { Button } from "../components/button";

const GET_SCOREBOARD_QUERY_KEY = "getScoreboard";
const GET_MEMBERS_QUERY_KEY = "getMembers";

const getGame = query(async (id) => {
  // TODO: try/catch
  const res = await api.get(`/games/${id}`);
  return res.data;
}, GET_SCOREBOARD_QUERY_KEY);

const getMembers = query(async (group_id) => {
  // TODO: try/catch
  const res = await api.get(`/groups/${group_id}/members`);
  return res.data as User[];
}, GET_MEMBERS_QUERY_KEY);

export const RecordGame = () => {
  const params = useParams();
  const group = useGroup();
  const game = createAsync(() => getGame(params.gameId));
  const members = createAsync(() => getMembers(group()));
  const navigate = useNavigate();

  // TODO: defaults
  const [selected, setSelected] = createSignal<(string | undefined)[]>([]);
  const [points, setPoints] = createSignal<(string | undefined)[]>([]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const p = points();
    const scores = selected().map((x, i) => ({
      user_id: x,
      score: parseInt(p[i] ?? "0"),
    }));

    // TODO: handle error
    await api.post(`/games/${game().id}/matches`, { scores });
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
