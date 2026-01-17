import {
  createAsync,
  query,
  revalidate,
  useNavigate,
  useSearchParams,
} from "@solidjs/router";
import { createSignal } from "solid-js";
import { api } from "../api";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Page } from "../components/page";
import { Dropdown } from "../components/dropdown";
import { GROUPS_QUERY_KEY } from "../components/sidebar";

export const getGroups = query(async () => {
  // TODO: try/catch
  const res = await api.get("/me/groups");
  return res.data as { id: number; name: string; created_at: string }[];
}, "myGroups");

export const CreateGame = () => {
  const navigate = useNavigate();
  const groups = createAsync(() => getGroups());

  const [query, setQuery] = useSearchParams();

  const [name, setName] = createSignal("");
  const [numPlayers, setNumPlayers] = createSignal("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const res = await api.post("/scoreboard", {
      name: name(),
      group_id: Number.parseInt(query.group as string, 10),
      players_per_game: Number.parseInt(numPlayers(), 10),
    });
    revalidate(GROUPS_QUERY_KEY);

    navigate(`/games/${res.data.id}/scoreboard`);
  }

  // TODO: handle no groups
  return (
    <Page title="Create Game">
      <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          label="Name"
          value={name()}
          onChange={setName}
          placeholder="e.g. Mario Kart Wii"
        />
        <Input
          label="Number of players per match"
          value={numPlayers()}
          onChange={setNumPlayers}
          placeholder="e.g. 4"
        />
        <Dropdown
          label="Group"
          // TODO: handle when not string
          value={(query.group as string | undefined) ?? ""}
          onChange={(value) => setQuery({ group: value })}
          fallback="No groups available"
          options={
            groups()?.map((g) => ({ label: g.name, value: g.id.toString() })) ??
            []
          }
        />
        <span class="flex gap-4">
          <Button type="submit">Create</Button>
          <Button variant="secondary">Cancel</Button>
        </span>
      </form>
    </Page>
  );
};
