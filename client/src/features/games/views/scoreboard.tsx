import { useNavigate, useParams } from "@solidjs/router";
import {
  type Component,
  createMemo,
  createSignal,
  For,
  Show,
  Suspense,
} from "solid-js";
import DataSvg from "@/assets/empty-states/data.svg";
import { Container } from "@/components/layout/container";
import { type Action, Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import { Change } from "@/components/ui/change";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import {
  type Heading,
  type Sort,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useGroup } from "@/features/groups/context/group-provider";
import { hasPermission } from "@/features/groups/types";
import { cn } from "@/lib/classname";
import { HighlightStatCard } from "../components/highlight-stat-card";
import { PodiumCard } from "../components/podium-card";
import { ProgressBar } from "../components/progress-bar";
import { useScoreboardData } from "../hooks/use-scoreboard-data";
import type { GameRouteParams, ScoringMetric } from "../types/game";
import { MEDAL_MAP } from "./create-game";

const TABLE_CAPTION = "Stats of all players playing this game";

const Medal: Component<{ medal: string; count: number; threshold: number }> = (
  props,
) => {
  return (
    <Show when={props.count > 0}>
      <Tooltip
        tooltip={`Number of games with at least ${props.threshold} points`}
      >
        <span>
          {props.count}
          {props.medal}
        </span>
      </Tooltip>
    </Show>
  );
};

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

  const hasMedals = () =>
    !!(
      scoreboardData.data?.game.star_threshold ??
      scoreboardData.data?.game.gold_threshold ??
      scoreboardData.data?.game.silver_threshold ??
      scoreboardData.data?.game.bronze_threshold
    );

  const tableHeadings = () =>
    [
      { label: "Rank", class: "w-12" },
      { label: "Name", sortProp: "name" },
      ...(hasMedals() ? [{ label: "Medals" }] : []),
      {
        label: "Win Rate",
        sortProp: "win_rate",
        defaultDirection: "descending",
        class: "w-1/3",
      },
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
        href: "edit",
        icon: "edit",
      });
    }

    if (
      hasPermission(group.userRole(), "member", auth.user()?.email_verified)
    ) {
      actions.push({
        text: "Record Match",
        variant: "primary",
        href: "record",
        icon: "notebookPen",
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

  const podiumTotal = () => scoreboardData.data?.podium.length || 0;

  // TODO: proper loading for scoreboard name
  return (
    <Page
      title={scoreboardData.data?.game.name ?? "Loading"}
      actions={actions()}
      class="gap-12"
    >
      <Show
        when={!scoreboardData.isError}
        fallback={
          <ErrorMessage title="Error" details="Couldn't load scoreboard data" />
        }
      >
        <Show
          when={scoreboardData.data?.entries.length !== 0}
          fallback={
            <EmptyState title="No matches yet!" img={DataSvg}>
              Record your first match to see your scoreboard
            </EmptyState>
          }
        >
          <div class="no-scrollbar flex snap-x overflow-x-auto px-6">
            <div class="mx-auto flex w-full flex-col flex-nowrap gap-4 md:flex-row md:items-end md:justify-center">
              <For each={[0, 1, 2].slice(0, podiumTotal())}>
                {(index) => (
                  <PodiumCard
                    stats={getStats(index)}
                    position={index + 1}
                    total={podiumTotal()}
                  />
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
                  scoreboardData.data?.highlights.highest_win_rate.user_name ??
                  ""
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
                  scoreboardData.data?.highlights.highest_average_score
                    .user_name ?? ""
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
                  scoreboardData.data?.highlights.highest_single_score
                    .user_name ?? ""
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
                  scoreboardData.data?.highlights.most_games_played.user_name ??
                  ""
                }
              />
            </div>
          </div>

          <Container class="w-full overflow-x-auto">
            <Table
              sortedBy={effectiveSort()}
              onSort={setSort}
              headings={tableHeadings()}
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

                      <TableCell>
                        <span class="inline-flex items-center gap-3">
                          <Avatar
                            class="size-7"
                            avatar={score.user_avatar}
                            colour={score.user_avatar_colour}
                          />
                          {score.user_name}
                        </span>
                      </TableCell>

                      <Show when={hasMedals()}>
                        <TableCell>
                          <span class="flex gap-3">
                            <Show
                              when={scoreboardData.data?.game.star_threshold}
                            >
                              {(threshold) => (
                                <Medal
                                  count={score.star_medals}
                                  medal={MEDAL_MAP.star}
                                  threshold={threshold()}
                                />
                              )}
                            </Show>
                            <Show
                              when={scoreboardData.data?.game.gold_threshold}
                            >
                              {(threshold) => (
                                <Medal
                                  count={score.gold_medals}
                                  medal={MEDAL_MAP.gold}
                                  threshold={threshold()}
                                />
                              )}
                            </Show>
                            <Show
                              when={scoreboardData.data?.game.silver_threshold}
                            >
                              {(threshold) => (
                                <Medal
                                  count={score.silver_medals}
                                  medal={MEDAL_MAP.silver}
                                  threshold={threshold()}
                                />
                              )}
                            </Show>
                            <Show
                              when={scoreboardData.data?.game.bronze_threshold}
                            >
                              {(threshold) => (
                                <Medal
                                  count={score.bronze_medals}
                                  medal={MEDAL_MAP.bronze}
                                  threshold={threshold()}
                                />
                              )}
                            </Show>
                          </span>
                        </TableCell>
                      </Show>

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
        </Show>
      </Show>
    </Page>
  );
};
