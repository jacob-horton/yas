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
import { StatCard } from "../components/stat-card";
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
  label: string;
  getValue: (data: PlayerStatsSummary) => string;
};

const LIFETIME_STATS: StatData[] = [
  {
    label: "WIN RATE",
    getValue: (d) => `${(d.lifetime.win_rate * 100).toFixed(0)}%`,
  },
  {
    label: "BEST SCORE",
    getValue: (d) => d.lifetime.best_score.toFixed(0),
  },
  {
    label: "AVERAGE SCORE",
    getValue: (d) => d.lifetime.average_score.toFixed(2),
  },
  {
    label: "TOTAL GAMES",
    getValue: (d) => d.lifetime.total_games.toFixed(0),
  },
];

const StatsLayout: ParentComponent = (props) => (
  <div class="flex items-center justify-center gap-4 overflow-x-auto">
    {props.children}
  </div>
);

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
        <ChartComponent
          data={
            history.data
              ?.map((s) => ({ score: s.score, rank: s.rank_in_match }))
              .toReversed() ?? []
          }
        />

        <Suspense
          fallback={
            <StatsLayout>
              <For each={LIFETIME_STATS}>
                {(stat) => <StatCardSkeleton label={stat.label} />}
              </For>
            </StatsLayout>
          }
        >
          <Show when={summary.data}>
            {(data) => (
              <StatsLayout>
                <For each={LIFETIME_STATS}>
                  {(stat) => (
                    <StatCard label={stat.label} stat={stat.getValue(data())} />
                  )}
                </For>
              </StatsLayout>
            )}
          </Show>
        </Suspense>

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
