import { revalidate, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupsApi } from "@/features/groups/api";
import { QK_GROUP_GAMES } from "@/features/groups/constants";
import { useGroup } from "@/features/groups/context/group-provider";
import type { CreateGameRequest } from "../types/game";

export const CreateGame = () => {
  const navigate = useNavigate();
  const group = useGroup();

  const [name, setName] = createSignal("");
  const [numPlayers, setNumPlayers] = createSignal("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const game: CreateGameRequest = {
      name: name(),
      players_per_match: Number.parseInt(numPlayers(), 10),
    };

    const res = await groupsApi.group(group()).createGame(game);

    revalidate(QK_GROUP_GAMES);
    navigate(`/groups/${group()}/games/${res.id}`);
  }

  return (
    <FormPage title="Create Game" onSubmit={handleSubmit}>
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
    </FormPage>
  );
};
