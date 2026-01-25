import { useParams } from "@solidjs/router";
import { Page } from "@/components/layout/page";
import { ChartComponent } from "../components/chart";
import { usePlayerStats } from "../hooks/use-player-stats";
import type { PlayerStatsRouteParams } from "../types";

export const PlayerStats = () => {
  const params = useParams<PlayerStatsRouteParams>();
  const stats = usePlayerStats(
    () => params.gameId,
    () => params.playerId,
  );

  return (
    <Page title="User Stats" showBack>
      <ChartComponent
        data={
          stats()?.map((s) => ({ score: s.score, rank: s.rank_in_match })) ?? []
        }
      />
    </Page>
  );
};
