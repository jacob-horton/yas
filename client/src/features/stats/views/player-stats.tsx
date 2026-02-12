import { useParams } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { For, Show, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import {
  type Heading,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { useUser } from "@/features/users/hooks/use-user";
import { cn } from "@/lib/classname";
import { formatDate } from "@/lib/format-date";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { RANK_TEXT_COLOURS } from "@/lib/rank-colours";
import { ChartComponent } from "../components/chart";
import { StatCard, type Colour, type Icon } from "../components/stat-card";
import { StatCardSkeleton } from "../components/stat-card.skeleton";
import { usePlayerHistory } from "../hooks/use-player-history";
import { usePlayerSummary } from "../hooks/use-player-summary";
import type { PlayerStatsRouteParams, PlayerStatsSummary } from "../types";

const TABLE_HEADINGS = [
  { label: "Date" },
  { label: "Rank" },
  { label: "Score" },
] as const satisfies Heading<string>[];

type StatData = {
  icon: Icon;
  colour: Colour;
  label: string;
  getValue: (data: PlayerStatsSummary) => string;
};

const LIFETIME_STATS: StatData[] = [
  {
    icon: "trophy",
    colour: "green",
    label: "Win Rate",
    getValue: (d) => `${(d.lifetime.win_rate * 100).toFixed(0)}%`,
  },
  {
    icon: "star",
    colour: "orange",
    label: "Best Score",
    getValue: (d) => d.lifetime.best_score.toFixed(0),
  },
  {
    icon: "chart",
    colour: "purple",
    label: "Average Score",
    getValue: (d) => d.lifetime.average_score.toFixed(2),
  },
  {
    icon: "stack",
    colour: "blue",
    label: "Total Games",
    getValue: (d) => d.lifetime.total_games.toFixed(0),
  },
];

export const PlayerStats = () => {
  const params = useParams<PlayerStatsRouteParams>();
  const history = usePlayerHistory(
    () => params.gameId,
    () => params.playerId,
  );

  const summary = usePlayerSummary(
    () => params.gameId,
    () => params.playerId,
  );

  const player = useUser(() => params.playerId);

  return (
    <Page title={`Stats for ${player.data?.name ?? "Loading"}`} showBack>
      <div class="flex flex-col gap-8 pb-42">
        <div class="flex items-center justify-center gap-4 pt-6 overflow-x-auto">
          <Suspense
            fallback={
              <For each={LIFETIME_STATS}>
                {(stat) => <StatCardSkeleton label={stat.label} />}
              </For>
            }
          >
            <Show when={summary.data}>
              {(data) => (
                <For each={LIFETIME_STATS}>
                  {(stat) => (
                    <StatCard
                      icon={stat.icon}
                      colour={stat.colour}
                      label={stat.label}
                      stat={stat.getValue(data())}
                    />
                  )}
                </For>
              )}
            </Show>
          </Suspense>
        </div>

        <div class="py-6">
          <ChartComponent
            data={
              history.data
                ?.map((s) => ({ score: s.score, rank: s.rank_in_match }))
                .toReversed() ?? []
            }
          />
        </div>

        <Table headings={TABLE_HEADINGS} caption="Match history">
          <Suspense fallback={<TableRowSkeleton numCols={3} />}>
            <Show when={history.data}>
              {(data) =>
                data().map((s) => (
                  <TableRow>
                    <TableCell>{formatDate(s.played_at)}</TableCell>
                    <TableCell>
                      <span
                        class={cn(
                          { "font-bold": !!RANK_TEXT_COLOURS[s.rank_in_match] },
                          RANK_TEXT_COLOURS[s.rank_in_match] ?? "text-gray-400",
                        )}
                      >
                        {ordinalSuffix(s.rank_in_match)}
                      </span>
                    </TableCell>
                    <TableCell>{s.score}</TableCell>
                  </TableRow>
                ))
              }
            </Show>
          </Suspense>
        </Table>
      </div>
    </Page>
  );
};
