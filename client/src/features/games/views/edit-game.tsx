import { useNavigate, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { FormPage, FormSection } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { useGame } from "@/features/games/hooks/use-game";
import { useGroup } from "@/features/groups/context/group-provider";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { SCORING_METRIC_LABELS } from "../constants";
import { useDeleteGame } from "../hooks/use-delete-game";
import { useUpdateGame } from "../hooks/use-update-game";
import { type Game, scoringMetrics, updateGameSchema } from "../types/game";
import { MEDAL_MAP, type MedalType } from "./create-game";

type Props = {
  initialData: Game;
};

// TODO: reduce duplication with create?
const EditGameForm: Component<Props> = (props) => {
  const navigate = useNavigate();
  const group = useGroup();

  const deleteGame = useDeleteGame(group.groupId);
  const updateGame = useUpdateGame();
  const toast = useToast();

  const { values, errors, setField, validate } = useZodForm(updateGameSchema, {
    name: props.initialData.name,
    players_per_match: props.initialData.players_per_match.toString(),
    metric: props.initialData.metric,

    medal_scores:
      (props.initialData.star_threshold ??
        props.initialData.gold_threshold ??
        props.initialData.silver_threshold ??
        props.initialData.bronze_threshold) !== null
        ? {
            star: props.initialData.star_threshold?.toString() ?? "",
            gold: props.initialData.gold_threshold?.toString() ?? "",
            silver: props.initialData.silver_threshold?.toString() ?? "",
            bronze: props.initialData.bronze_threshold?.toString() ?? "",
          }
        : undefined,
  });

  const isMedalsEnabled = () => !!values.medal_scores;
  const toggleMedals = (checked: boolean) => {
    if (checked) {
      setField("medal_scores", {
        star: "",
        gold: "",
        silver: "",
        bronze: "",
      });
    } else {
      setField("medal_scores", undefined);
    }
  };

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const validData = validate();
    if (!validData) return;

    updateGame.mutate(
      { groupId: props.initialData.id, payload: validData },
      {
        onSuccess: () => {
          toast.success({
            title: "Game updated",
            description: "Game updated successfully",
          });

          navigate(-1);
        },
      },
    );
  }

  const { showConfirm } = useConfirmation();
  const handleDelete = async () => {
    const isConfirmed = await showConfirm({
      title: "Delete Group",
      description: (
        <p>
          Are you sure you would like to delete{" "}
          <strong>{props.initialData.name}</strong>? This cannot be undone.
        </p>
      ),
      confirmText: "Delete",
      danger: true,
    });

    if (isConfirmed) {
      deleteGame.mutate(props.initialData.id, {
        onSuccess: () => {
          toast.success({
            title: "Game deleted",
            description: "Game deleted successfully",
          });

          navigate("/");
        },
      });
    }
  };

  return (
    <FormPage
      title="Edit Game"
      onSubmit={handleSubmit}
      actions={[
        {
          text: "Delete",
          onAction: handleDelete,
          variant: "secondary",
          danger: true,
        },
      ]}
    >
      <FormSection title="Details">
        <Input
          label="Name"
          value={values.name}
          onChange={(val) => setField("name", val)}
          placeholder="e.g. Mario Kart Wii"
          error={errors.name}
        />

        {/* TODO: tooltips to explain these inputs */}
        <Input
          label="# of players per match"
          value={values.players_per_match}
          onChange={(val) => setField("players_per_match", val)}
          placeholder="e.g. 4"
          error={errors.players_per_match}
        />

        <Dropdown
          label="Scoring metric"
          tooltip="The metric you want to use to determine the rankings of players"
          value={values.metric}
          onChange={(val) => setField("metric", val)}
          options={scoringMetrics.map((m) => ({
            label: SCORING_METRIC_LABELS[m],
            value: m,
          }))}
          error={errors.metric}
        />
      </FormSection>

      <FormSection
        title="Medals"
        tooltip="Provide players with medals for reaching a certain score"
        enabled={isMedalsEnabled()}
        onToggle={toggleMedals}
      >
        <div class="grid max-w-96 grid-cols-2 gap-6">
          <For each={Object.entries(MEDAL_MAP)}>
            {([medal, emoji], i) => {
              return (
                <Input
                  label={`# of points for ${emoji}`}
                  inputMode="numeric"
                  // biome-ignore lint/style/noNonNullAssertion: Will only show when medal_scores is defined
                  value={values.medal_scores![medal as MedalType]}
                  onChange={(val) =>
                    setField("medal_scores", medal as MedalType, val)
                  }
                  placeholder={`e.g. ${((3 - i()) / 5) * 25 + 75}`}
                  error={errors[`medal_scores.${medal as MedalType}`]}
                />
              );
            }}
          </For>
        </div>
      </FormSection>

      <span class="flex gap-4">
        <Button type="submit" loading={updateGame.isPending}>
          Update
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          loading={updateGame.isPending}
        >
          Cancel
        </Button>
      </span>
    </FormPage>
  );
};

export const EditGame = () => {
  const params = useParams();
  const game = useGame(() => params.gameId);

  // TODO: better loading state
  return (
    <Show when={game.data} fallback={<p>Loading game details...</p>}>
      {(data) => <EditGameForm initialData={data()} />}
    </Show>
  );
};
