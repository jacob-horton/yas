import { useParams } from "@solidjs/router";
import { Page } from "@/components/layout/page";
import { Table } from "@/components/ui/table";
import { useUser } from "@/features/users/hooks/use-user";
import { cn } from "@/lib/classname";
import { formatDate } from "@/lib/format-date";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { RANK_TEXT_COLOURS } from "@/lib/rank-colours";
import { ChartComponent } from "../components/chart";
import { usePlayerStats } from "../hooks/use-player-stats";
import type { PlayerStatsRouteParams } from "../types";

export const PlayerStats = () => {
  const params = useParams<PlayerStatsRouteParams>();
  const stats = usePlayerStats(
    () => params.gameId,
    () => params.playerId,
  );

  const player = useUser(() => params.playerId);

  return (
    <Page title={`Stats for ${player()?.name ?? "Loading"}`} showBack>
      <div class="flex flex-col gap-8">
        <ChartComponent
          data={
            stats()?.map((s) => ({ score: s.score, rank: s.rank_in_match })) ??
            []
          }
        />

        <Table headings={["Date", "Rank", "Score"]} caption="Match history">
          {stats()?.map((s) => (
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
