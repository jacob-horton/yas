import { Page } from "@/components/layout/page";
import { GAMES_QUERY_KEY } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGroup } from "@/features/groups/context/group-provider";
import { api } from "@/lib/api";
import { revalidate, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

export const CreateGame = () => {
  const navigate = useNavigate();
  const group = useGroup();

  const [name, setName] = createSignal("");
  const [numPlayers, setNumPlayers] = createSignal("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const res = await api.post(`/groups/${group()}/games`, {
      name: name(),
      players_per_match: Number.parseInt(numPlayers(), 10),
    });
    revalidate(GAMES_QUERY_KEY);

    navigate(`/groups/${group()}/games/${res.data.id}`);
  }

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
