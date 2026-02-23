import { useNavigate } from "@solidjs/router";
import { FormPage } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useGroup } from "@/features/groups/context/group-provider";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { SCORING_METRIC_LABELS } from "../constants";
import { useCreateGame } from "../hooks/use-create-game";
import { createGameSchema, scoringMetrics } from "../types/game";

export const CreateGame = () => {
  const navigate = useNavigate();
  const group = useGroup();

  const createGame = useCreateGame();
  const toast = useToast();

  const { values, errors, setField, validate } = useZodForm(createGameSchema, {
    name: "",
    players_per_match: "",
    metric: scoringMetrics[0],
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    createGame.mutate(
      { groupId: group.groupId(), payload: validData },
      {
        onSuccess: (resp) => {
          toast.success({
            title: "Game created",
            description: "Game created successfully",
          });

          navigate(`/groups/${group.groupId()}/games/${resp.id}`);
        },
      },
    );
  }

  return (
    <FormPage title="Create Game" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={values.name}
        onChange={(val) => setField("name", val)}
        placeholder="e.g. Mario Kart Wii"
        error={errors.name}
      />

      {/* TODO: tooltips to explain these inputs */}
      <Input
        label="Number of players per match"
        value={values.players_per_match}
        onChange={(val) => setField("players_per_match", val)}
        placeholder="e.g. 4"
        error={errors.players_per_match}
      />

      <Dropdown
        label="Scoring metric"
        value={values.metric}
        onChange={(val) => setField("metric", val)}
        options={scoringMetrics.map((m) => ({
          label: SCORING_METRIC_LABELS[m],
          value: m,
        }))}
        error={errors.metric}
      />

      <span class="flex gap-4">
        <Button type="submit" loading={createGame.isPending}>
          Create
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          loading={createGame.isPending}
        >
          Cancel
        </Button>
      </span>
    </FormPage>
  );
};
