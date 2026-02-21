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
import { StatCard } from "../components/stat-card";
import { LIFETIME_STATS } from "../constants";
import { usePlayerHighlights } from "../hooks/use-player-highlights";
import { usePlayerHistory } from "../hooks/use-player-history";
import type { PlayerStatsRouteParams } from "../types";

const TABLE_HEADINGS = [
  { label: "Date" },
  { label: "Rank" },
  { label: "Score" },
] as const satisfies Heading<string>[];

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
