import { useNavigate, useParams } from "@solidjs/router";
import { createMemo, createSignal, For, Suspense } from "solid-js";
import { Container } from "@/components/layout/container";
import { type Action, Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import { Change } from "@/components/ui/change";
import {
  type Heading,
  type Sort,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useGroup } from "@/features/groups/context/group-provider";
import { hasPermission } from "@/features/groups/types";
import { cn } from "@/lib/classname";
import { HighlightStatCard } from "../components/highlight-stat-card";
import { PodiumCard } from "../components/podium-card";
import { ProgressBar } from "../components/progress-bar";
import { useScoreboardData } from "../hooks/use-scoreboard-data";
import type { GameRouteParams, ScoringMetric } from "../types/game";

const TABLE_CAPTION = "Stats of all players playing this game";

export const Scoreboard = () => {
  const params = useParams<GameRouteParams>();
  const navigate = useNavigate();
  const auth = useAuth();

  const userId = () => auth.user()?.id;
  const group = useGroup();

  const [sort, setSort] = createSignal<
    Sort<ScoringMetric | "name"> | undefined
  >(undefined);

  const scoreboardData = useScoreboardData(() => params.gameId, sort);

  // User/front-end sort, fall back to default sort metric
  const effectiveSort = () => {
    const userSort = sort();
    if (userSort) return userSort;

    const metric = scoreboardData.data?.game.metric;
    if (!metric) return undefined;

    return {
      property: metric,
      direction: "descending",
    } satisfies Sort<ScoringMetric>;
  };

  const tableHeadings = [
    { label: "Rank", class: "w-12" },
    { label: "Name", sortProp: "name" },
    { label: "Win Rate", sortProp: "win_rate", defaultDirection: "descending" },
    {
      label: "Points/Game",
      sortProp: "average_score",
      defaultDirection: "descending",
    },
  ] as const satisfies Heading<string>[];

  const actions = createMemo(() => {
    const actions: Action[] = [];

    if (hasPermission(group.userRole(), "admin", auth.user()?.email_verified)) {
      actions.push({
        text: "Edit",
        variant: "secondary",
        onAction: () => navigate("edit"),
      });
    }

    if (
      hasPermission(group.userRole(), "member", auth.user()?.email_verified)
    ) {
      actions.push({
        text: "Record Match",
        variant: "primary",
        onAction: () => navigate("record"),
      });
    }

    return actions;
  });

  const getStats = (index: number) => {
    const s = scoreboardData.data?.podium?.[index];
    if (!s) return undefined;

    return {
      avatar: s.user_avatar,
      avatarColour: s.user_avatar_colour,
      name: s.user_name,
      winRate: s.win_rate,
      pointsPerGame: s.average_score,
      rank: s.rank,
    };
  };

  // TODO: proper loading for scoreboard name
  return (
    <Page
      title={scoreboardData.data?.game.name ?? "Loading"}
      actions={actions()}
      class="gap-12"
    >
      <div class="no-scrollbar flex snap-x overflow-x-auto px-6">
        <div class="mx-auto flex flex-nowrap items-end gap-4">
          {/* Sort 2nd, 1st, 3rd for podium */}
          <For each={[1, 0, 2]}>
            {(index) => (
              <PodiumCard stats={getStats(index)} position={index + 1} />
            )}
          </For>
        </div>
      </div>

      <div class="no-scrollbar flex snap-x overflow-x-auto px-6">
        <div class="mx-auto flex flex-nowrap gap-4">
          <HighlightStatCard
            colour="orange"
            icon="crown"
            label="MVP"
            subtext="Highest win rate"
            loading={!scoreboardData.data}
            value={`${((scoreboardData.data?.highlights.highest_win_rate.value ?? 0) * 100).toFixed(0)}%`}
            userName={
              scoreboardData.data?.highlights.highest_win_rate.user_name ?? ""
            }
          />

          <HighlightStatCard
            colour="green"
            icon="wheat"
            label="Point Farmer"
            subtext="Highest average score"
            loading={!scoreboardData.data}
            value={
              scoreboardData.data?.highlights.highest_average_score.value.toFixed(
                2,
              ) ?? "0"
            }
            userName={
              scoreboardData.data?.highlights.highest_average_score.user_name ??
              ""
            }
          />

          <HighlightStatCard
            colour="purple"
            icon="mountain"
            label="Peak Performer"
            subtext="Highest single score"
            loading={!scoreboardData.data}
            value={
              scoreboardData.data?.highlights.highest_single_score.value.toFixed(
                0,
              ) ?? "0"
            }
            userName={
              scoreboardData.data?.highlights.highest_single_score.user_name ??
              ""
            }
          />

          <HighlightStatCard
            colour="blue"
            icon="infinity"
            label="Addict"
            subtext="Most games played"
            loading={!scoreboardData.data}
            value={
              scoreboardData.data?.highlights.most_games_played.value.toFixed(
                0,
              ) ?? "0"
            }
            userName={
              scoreboardData.data?.highlights.most_games_played.user_name ?? ""
            }
          />
        </div>
      </div>

      <Container>
        <Table
          sortedBy={effectiveSort()}
          onSort={setSort}
          headings={tableHeadings}
          caption={TABLE_CAPTION}
        >
          <Suspense fallback={<TableRowSkeleton numCols={4} />}>
            <For each={scoreboardData.data?.entries}>
              {(score) => (
                <TableRow
                  onClick={() => navigate(`player/${score.user_id}`)}
                  class={cn({
                    "font-semibold": score.user_id === userId(),
                  })}
                >
                  <TableCell>
                    <span
                      class={cn(
                        "flex items-center gap-2",
                        score.user_id === userId()
                          ? "font-bold text-gray-600"
                          : "text-gray-400",
                      )}
                    >
                      {score.rank}
                      <Change value={score.rank_diff} />
                    </span>
                  </TableCell>
                  <TableCell class="flex items-center gap-3">
                    <Avatar
                      class="size-7"
                      avatar={score.user_avatar}
                      colour={score.user_avatar_colour}
                    />
                    {score.user_name}
                  </TableCell>
                  <TableCell>
                    <span class="flex w-4/5 min-w-32 items-center gap-2">
                      <ProgressBar percentage={score.win_rate * 100} />
                      <span class="flex items-center gap-2">
                        <span class="min-w-14 text-right">
                          {(score.win_rate * 100).toFixed(0)}%
                        </span>
                        <Change value={score.win_rate_diff} />
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span class="flex items-center gap-2">
                      {score.average_score.toFixed(2)}
                      <Change value={score.average_score_diff} />
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </For>
          </Suspense>
        </Table>
      </Container>
    </Page>
  );
};
