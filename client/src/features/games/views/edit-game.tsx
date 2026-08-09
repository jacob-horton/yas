import { useNavigate, useParams } from "@solidjs/router";
import { addDays, addMonths, startOfDay } from "date-fns";
import TrashIcon from "lucide-solid/icons/trash-2";
import type { Component } from "solid-js";
import { createMemo, createSignal, For, Show } from "solid-js";
import { FormPage, FormSection } from "@/components/layout/form-page";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { useGame } from "@/features/games/hooks/use-game";
import { useGroup } from "@/features/groups/context/group-provider";
import { toInputDate } from "@/lib/date";
import { useZodForm } from "@/lib/zod/use-zod-form";
import { SCORING_METRIC_LABELS } from "../constants";
import { useDeleteGame } from "../hooks/use-delete-game";
import { useGameSeasons } from "../hooks/use-game-seasons";
import { useUpdateGame } from "../hooks/use-update-game";
import {
  type DurationUnit,
  durationUnits,
  type Game,
  scoringMetrics,
  updateGameSchema,
} from "../types/game";
import type { Season } from "../types/scoreboard";
import { MEDAL_MAP, type MedalType } from "./create-game";

type Props = {
  initialData: Game;
  currentSeason: Season;
};

function getCalculatedNextSeasonStart(
  currentSeasonStart: Date,
  seasonDuration?: { value: number; unit: DurationUnit },
) {
  if (!seasonDuration) {
    return null;
  }

  const nextSeasonStart =
    seasonDuration.unit === "days"
      ? addDays(currentSeasonStart, seasonDuration.value)
      : addMonths(currentSeasonStart, seasonDuration.value);

  return nextSeasonStart;
}

// TODO: reduce duplication with create?
const EditGameForm: Component<Props> = (props) => {
  const navigate = useNavigate();
  const group = useGroup();

  const deleteGame = useDeleteGame(group.groupId);
  const updateGame = useUpdateGame(group.groupId);
  const toast = useToast();

  const { values, errors, setField, validate } = useZodForm(updateGameSchema, {
    name: props.initialData.name,
    min_players_per_match: props.initialData.min_players_per_match.toString(),
    max_players_per_match: props.initialData.max_players_per_match.toString(),
    metric: props.initialData.metric,

    season_duration: props.initialData.season_duration
      ? {
          value: props.initialData.season_duration?.value.toString() ?? "",
          unit: props.initialData.season_duration?.unit ?? "days",
        }
      : undefined,

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

  const isSeasonsEnabled = () => !!values.season_duration;
  const toggleSeasons = (checked: boolean) => {
    if (checked) {
      setField("season_duration", {
        value: "30",
        unit: "days",
      });
    } else {
      setField("season_duration", undefined);
      setUserSetSeasonStartDate(undefined);
    }
  };

  const defaultSeasonStartDate = createMemo(() => {
    let nextSeasonStart = getCalculatedNextSeasonStart(
      new Date(props.currentSeason.start_date),
      values.season_duration
        ? {
            value: parseInt(values.season_duration.value, 10),
            unit: values.season_duration.unit,
          }
        : undefined,
    );

    if (!nextSeasonStart) {
      return null;
    }

    const today = startOfDay(new Date());
    if (nextSeasonStart < today) {
      nextSeasonStart = today;
    }

    try {
      return toInputDate(nextSeasonStart);
    } catch {
      return toInputDate(today);
    }
  });

  const [userSetSeasonStartDate, setUserSetSeasonStartDate] = createSignal<
    string | undefined
  >(undefined);

  const seasonStartDate = () =>
    userSetSeasonStartDate() ?? defaultSeasonStartDate();

  const seasonStartDateError = createMemo(() => {
    if (!isSeasonsEnabled() || !seasonStartDate()) return undefined;

    const today = startOfDay(new Date());
    // biome-ignore lint/style/noNonNullAssertion: This funciton is only hit when there is a start date
    if (new Date(seasonStartDate()!) < today) {
      return "Must be today or in the future";
    }

    return undefined;
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const validData = validate();
    if (!validData || seasonStartDateError()) return;

    const nextSeasonStart = seasonStartDate();

    updateGame.mutate(
      {
        gameId: props.initialData.id,
        payload: {
          ...validData,
          next_season_start: nextSeasonStart
            ? new Date(nextSeasonStart).toISOString()
            : undefined,
        },
      },
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
          type: "button",
          text: "Delete",
          icon: TrashIcon,
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

        <Input
          label="Minimum # of players per match"
          tooltip="This will determine the minimum number of player scores that must be entered when recording a match"
          value={values.min_players_per_match}
          onChange={(val) => setField("min_players_per_match", val)}
          placeholder="e.g. 4"
          error={errors.min_players_per_match}
        />

        <Input
          label="Maximum # of players per match"
          tooltip="This will determine the maximum number of player scores that must be entered when recording a match"
          value={values.max_players_per_match}
          onChange={(val) => setField("max_players_per_match", val)}
          placeholder="e.g. 4"
          error={errors.max_players_per_match}
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
        title="Seasons"
        tooltip="Start the leaderboard again each season to make things new and exciting!"
        enabled={isSeasonsEnabled()}
        onToggle={toggleSeasons}
      >
        <Input
          label="Duration"
          tooltip="How long a season lasts"
          // biome-ignore lint/style/noNonNullAssertion: Will only show when season_duration is defined
          value={values.season_duration!.value}
          onChange={(val) => setField("season_duration", "value", val)}
          placeholder="e.g. 30"
          error={errors["season_duration.value"]}
        />

        <Dropdown
          label="Unit"
          // biome-ignore lint/style/noNonNullAssertion: Will only show when season_duration is defined
          value={values.season_duration!.unit}
          onChange={(val) =>
            setField("season_duration", "unit", val as DurationUnit)
          }
          options={durationUnits.map((m) => ({
            label: m[0].toUpperCase() + m.slice(1),
            value: m,
          }))}
          error={errors["season_duration.unit"]}
        />

        <Input
          type="date"
          label="Next season start date"
          tooltip="The date that the next season will start on"
          onChange={setUserSetSeasonStartDate}
          // biome-ignore lint/style/noNonNullAssertion: season start date is only null when this section isn't toggled
          value={seasonStartDate()!}
          error={seasonStartDateError()}
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
  const params = useParams<{ gameId: string }>();
  const game = useGame(() => params.gameId);
  const seasons = useGameSeasons(() => params.gameId);

  // TODO: better loading state
  return (
    <Show when={game.data} fallback={<p>Loading game details...</p>}>
      {(data) => (
        <Show when={seasons.data} fallback={<p>Loading seasons...</p>}>
          {(seasonData) => (
            <EditGameForm
              initialData={data()}
              currentSeason={seasonData()[0]}
            />
          )}
        </Show>
      )}
    </Show>
  );
};
