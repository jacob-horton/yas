import { useParams } from "@solidjs/router";
import { createMemo, For, Show, Suspense } from "solid-js";
import VisualiseDataSvg from "@/assets/empty-states/visualise-data.svg";
import { Container } from "@/components/layout/container";
import { type Action, Page } from "@/components/layout/page";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { SmartDate } from "@/components/ui/smart-date";
import {
  type Heading,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { useGameSeasons } from "@/features/games/hooks/use-game-seasons";
import { seasonName, seasonSessionKey } from "@/features/games/seasons";
import { isApiError } from "@/lib/api";
import { cn } from "@/lib/classname";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { RANK_TEXT_COLOURS } from "@/lib/rank-colours";
import { useSessionStorage } from "@/lib/use-session-storage";
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

  const [seasonId, setSeasonId] = useSessionStorage(() =>
    seasonSessionKey(params.gameId),
  );

  const history = usePlayerHistory(
    () => params.gameId,
    () => params.playerId,
    () => seasonId() ?? undefined,
  );

  const highlights = usePlayerHighlights(
    () => params.gameId,
    () => params.playerId,
    () => seasonId() ?? undefined,
  );

  const seasons = useGameSeasons(() => params.gameId);

  const effectiveSeasonId = () =>
    seasonId() ??
    history.data?.season_id ??
    highlights.data?.season_id ??
    undefined;

  const actions = createMemo(
    () =>
      [
        {
          type: "menu",
          options:
            seasons.data?.map((s) => ({
              value: s.id,
              label: s.name ?? `Season ${s.number}`,
              onClick: () => setSeasonId(s.id),
            })) ?? [],
          value: effectiveSeasonId() ?? "",
          text: seasonName(
            seasons.data?.find((s) => s.id === effectiveSeasonId()),
          ),
        },
      ] satisfies Action[],
  );

  return (
    <Page
      title={`Stats for ${history.data?.player.name ?? highlights.data?.player.name ?? "Loading..."}`}
      showBack
      actions={actions()}
      class="flex flex-col gap-8"
    >
      <Show
        when={!highlights.isError}
        fallback={
          // NOTE: Only shows error message when it's not "not enough data"
          <Show
            when={
              !(
                isApiError(highlights.error) &&
                highlights.error.response?.status === 422
              )
            }
          >
            <ErrorMessage
              title="Error"
              details="Couldn't load player highlights"
            />
          </Show>
        }
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
      </Show>

      <Show
        when={!history.isError}
        fallback={
          <ErrorMessage title="Error" details="Couldn't load player history" />
        }
      >
        <Show
          when={history.isLoading || (history.data?.matches.length ?? 0) > 2}
          fallback={
            <EmptyState title="Not enough data" img={VisualiseDataSvg}>
              Record more matches to see your match history
            </EmptyState>
          }
        >
          <Container class="flex flex-col gap-8">
            <PlayerHistoryChart
              data={
                history.data?.matches
                  .map((s) => ({ score: s.score, rank: s.rank_in_match }))
                  .toReversed() ?? []
              }
            />

            <Table headings={TABLE_HEADINGS} caption="Match history">
              <Suspense fallback={<TableRowSkeleton numCols={3} />}>
                <Show when={history.data?.matches}>
                  {(data) =>
                    data().map((s) => (
                      <TableRow>
                        <TableCell>
                          <SmartDate date={s.played_at} />
                        </TableCell>
                        <TableCell>
                          <span
                            class={cn(
                              {
                                "font-semibold":
                                  !!RANK_TEXT_COLOURS[s.rank_in_match],
                              },
                              RANK_TEXT_COLOURS[s.rank_in_match] ??
                                "text-gray-400",
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
        </Show>
      </Show>
    </Page>
  );
};
