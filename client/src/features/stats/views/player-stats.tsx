import { useParams } from "@solidjs/router";
import { Page } from "@/components/layout/page";
import { Table } from "@/components/ui/table";
import { useUser } from "@/features/users/hooks/use-user";
import { cn } from "@/lib/classname";
import { formatDate } from "@/lib/format-date";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { RANK_TEXT_COLOURS } from "@/lib/rank-colours";
import { ChartComponent } from "../components/chart";
import { usePlayerHistory } from "../hooks/use-player-history";
import { usePlayerSummary } from "../hooks/use-player-summary";
import type { PlayerStatsRouteParams } from "../types";
import { StatCard } from "../components/stat-card";

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
    <Page title={`Stats for ${player()?.name ?? "Loading"}`} showBack>
      <div class="flex flex-col gap-8">
        <ChartComponent
          data={
            history()
              ?.map((s) => ({ score: s.score, rank: s.rank_in_match }))
              .toReversed() ?? []
          }
        />

        <div class="flex flex-row flex-wrap items-center justify-center gap-8">
          <div class="grid w-fit grid-cols-2 gap-4">
            <StatCard
              label="WIN RATE"
              stat={`${((summary()?.lifetime.win_rate ?? 0) * 100).toFixed(0)}%`}
            />
            <StatCard
              label="BEST SCORE"
              stat={(summary()?.lifetime.best_score ?? 0).toFixed(0)}
            />
            <StatCard
              label="AVERAGE SCORE"
              stat={(summary()?.lifetime.average_score ?? 0).toFixed(2)}
            />
            <StatCard
              label="TOTAL GAMES"
              stat={(summary()?.lifetime.total_games ?? 0).toFixed(0)}
            />
          </div>

          <div class="grid w-fit grid-cols-2 gap-4">
            <StatCard
              label="WIN RATE"
              stat={`${((summary()?.period.win_rate ?? 0) * 100).toFixed(0)}%`}
            />
            <StatCard
              label="BEST SCORE"
              stat={(summary()?.period.best_score ?? 0).toFixed(0)}
            />
            <StatCard
              label="AVERAGE SCORE"
              stat={(summary()?.period.average_score ?? 0).toFixed(2)}
            />
            <StatCard
              label="CURRENT RANK"
              stat={ordinalSuffix(summary()?.period.rank ?? 0)}
            />
          </div>
        </div>

        <Table headings={["Date", "Rank", "Score"]} caption="Match history">
          {history()?.map((s) => (
            <Table.Row>
              <Table.Cell>{formatDate(s.played_at)}</Table.Cell>
              <Table.Cell>
                <span
                  class={cn(
                    { "font-bold": !!RANK_TEXT_COLOURS[s.rank_in_match] },
                    RANK_TEXT_COLOURS[s.rank_in_match] ?? "text-gray-400",
                  )}
                >
                  {ordinalSuffix(s.rank_in_match)}
                </span>
              </Table.Cell>
              <Table.Cell>{s.score}</Table.Cell>
            </Table.Row>
          ))}
        </Table>
      </div>
    </Page>
  );
};
