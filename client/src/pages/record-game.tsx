import { createAsync, query, useParams } from "@solidjs/router";
import { createSignal, For, Suspense } from "solid-js";
import { api } from "../api";
import type { User } from "../auth/auth-provider";
import { Dropdown } from "../components/dropdown";
import { Page } from "../components/page";

const GET_SCOREBOARD_QUERY_KEY = "getScoreboard";
const GET_MEMBERS_QUERY_KEY = "getMembers";

const getScoreboard = query(async (id) => {
  // TODO: try/catch
  const res = await api.get(`/games/${id}/scoreboard`);
  return res.data as {
    id: number;
    name: string;
    players_per_game: number;
    group_id: number;
  };
}, GET_SCOREBOARD_QUERY_KEY);

const getMembers = query(async (group_id) => {
  // TODO: try/catch
  const res = await api.get(`/group/${group_id}/members`);
  return res.data as User[];
}, GET_MEMBERS_QUERY_KEY);

export const RecordGame = () => {
  const params = useParams();
  const scoreboard = createAsync(() => getScoreboard(params.gameId));
  const members = createAsync(() => {
    const sb = scoreboard();
    return sb ? getMembers(sb.group_id) : Promise.resolve(undefined);
  });
  const [selected, setSelected] = createSignal<(string | undefined)[]>([]);

  return (
    <Page title="Record Game">
      <Suspense>
        <p>
          Recording game for <b>{scoreboard()?.name}</b>
        </p>
        <div class="flex flex-col gap-4">
          <For each={Array.from(Array(scoreboard()?.players_per_game).keys())}>
            {(i) => (
              <>
                <Dropdown
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
                <div></div>
              </>
            )}
          </For>
        </div>
      </Suspense>
    </Page>
  );
};
