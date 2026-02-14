import { useParams } from "@solidjs/router";
import { For, Show, Suspense } from "solid-js";
import { Container } from "@/components/layout/container";
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
import { PlayerHistoryChart } from "../components/player-history-chart";
import { type Colour, type Icon, StatCard } from "../components/stat-card";
import { usePlayerHighlights } from "../hooks/use-player-highlights";
import { usePlayerHistory } from "../hooks/use-player-history";
import type { PlayerHighlightStats, PlayerStatsRouteParams } from "../types";

const TABLE_HEADINGS = [
  { label: "Date" },
  { label: "Rank" },
  { label: "Score" },
] as const satisfies Heading<string>[];

type StatData = {
  icon: Icon;
  colour: Colour;
  label: string;
  getValue: (data: PlayerHighlightStats) => string;
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
  {
    icon: "hash",
    colour: "yellow",
    label: "Current Rank",
    getValue: (d) => ordinalSuffix(d.lifetime.rank),
  },
];

export const PlayerStats = () => {
  const params = useParams<PlayerStatsRouteParams>();
  const history = usePlayerHistory(
    () => params.gameId,
    () => params.playerId,
  );

  const highlights = usePlayerHighlights(
    () => params.gameId,
    () => params.playerId,
  );

  const player = useUser(() => params.playerId);

  return (
    <Page
      title={`Stats for ${player.data?.name ?? "Loading"}`}
      showBack
      class="flex flex-col gap-8"
    >
      <div class="no-scrollbar flex w-full overflow-x-auto px-6 py-6">
        <div class="mx-auto flex flex-nowrap gap-4">
          <For each={LIFETIME_STATS}>
            {(stat) => (
              <StatCard
                icon={stat.icon}
                colour={stat.colour}
                label={stat.label}
                loading={!highlights.data}
                stat={
                  highlights.data ? stat.getValue(highlights.data) : undefined
                }
              />
            )}
          </For>
        </div>
      </div>

      <Container class="flex flex-col gap-8">
        <PlayerHistoryChart
          data={
            history.data
              ?.map((s) => ({ score: s.score, rank: s.rank_in_match }))
              .toReversed() ?? []
          }
        />

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
                          {
                            "font-bold": !!RANK_TEXT_COLOURS[s.rank_in_match],
                          },
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
      </Container>
    </Page>
  );
};
