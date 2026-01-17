import { revalidate, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { api } from "../api";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Page } from "../components/page";
import { useGroup } from "../group-provider";
import { GAMES_QUERY_KEY } from "../components/sidebar";

export const CreateGame = () => {
  const navigate = useNavigate();

  const [name, setName] = createSignal("");
  const [numPlayers, setNumPlayers] = createSignal("");
  const { group } = useGroup();

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const res = await api.post(`/groups/${group()}/games`, {
      name: name(),
      players_per_match: Number.parseInt(numPlayers(), 10),
    });
    revalidate(GAMES_QUERY_KEY);

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
        <span class="flex gap-4">
          <Button type="submit">Create</Button>
          <Button variant="secondary">Cancel</Button>
        </span>
      </form>
    </Page>
  );
};
