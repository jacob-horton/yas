import { Page } from "@/components/layout/page";
import { Table } from "@/components/ui/table";
import { useGroup } from "@/features/groups/context/group-provider";
import { api } from "@/lib/api";
import { createAsync, query, useNavigate, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { For, Suspense } from "solid-js";
import { PodiumCard, PodiumCardSkeleton } from "../components/podium-card";
import { ProgressBar } from "../components/progress-bar";
import type { GameRouteParams } from "../types";

const getScoreboardData = query(async (id) => {
  // TODO: try/catch
  const res = await api.get(`/games/${id}/scoreboard`);
  return res.data;
}, "scoreboardData");

const LoadingText = () => {
  return (
    <div class="inline-block h-[1em] w-full animate-pulse rounded-sm bg-gray-200" />
  );
};

const LoadingRows: Component<{ numCols: number; numRows?: number }> = (
  props,
) => {
  return (
    <For each={Array(props.numRows ?? 5)}>
      {() => (
        <Table.Row>
          <For each={Array(props.numCols)}>
            {() => (
              <Table.Cell>
                <LoadingText />
              </Table.Cell>
            )}
          </For>
        </Table.Row>
      )}
    </For>
  );
};

export const Scoreboard = () => {
  const params = useParams<GameRouteParams>();
  const group = useGroup();
  const scoreboardData = createAsync(() => getScoreboardData(params.gameId));
  const navigate = useNavigate();

  // TODO: proper loading for scoreboard name
  return (
    <Page
      title={scoreboardData()?.game.name ?? "Loading"}
      actions={[
        {
          text: "Record Game",
          variant: "primary",
          onAction: () =>
            navigate(`/groups/${group()}/games/${params.gameId}/record`),
        },
      ]}
    >
      <div class="flex flex-col gap-6">
        <div class="flex gap-6">
          <Suspense
            fallback={
              <For each={Array(3)}>
                {(_, index) => <PodiumCardSkeleton position={index() + 1} />}
              </For>
            }
          >
            <For each={scoreboardData()?.entries?.slice(0, 3)}>
              {(score, index) => (
                <PodiumCard
                  name={score.user_name}
                  winRate={score.win_rate}
                  pointsPerGame={score.average_score}
                  position={index() + 1}
                />
              )}
            </For>
          </Suspense>
        </div>
        <Table
          headings={["No.", "Name", "Win Rate", "Points/Game"]}
          caption="Stats of all players playing this game"
        >
          <Suspense fallback={<LoadingRows numCols={4} />}>
            <For each={scoreboardData()?.entries}>
              {(score, index) => (
                <Table.Row>
                  <Table.Cell>
                    <span class="text-gray-400">{index() + 1}</span>
                  </Table.Cell>
                  <Table.Cell>{score.user_name}</Table.Cell>
                  <Table.Cell>
                    <span class="flex w-48 min-w-16 items-center">
                      <ProgressBar percentage={score.win_rate * 100} />
                      <span class="w-18 min-w-10 text-right">
                        {(score.win_rate * 100).toFixed(0)}%
                      </span>
                    </span>
                  </Table.Cell>
                  <Table.Cell>{score.average_score.toFixed(2)}</Table.Cell>
                </Table.Row>
              )}
            </For>
          </Suspense>
        </Table>
      </div>
    </Page>
  );
};
