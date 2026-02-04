import { useNavigate, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { createSignal, For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import {
  type Heading,
  type Sort,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { PodiumCard, PodiumCardSkeleton } from "../components/podium-card";
import { ProgressBar } from "../components/progress-bar";
import { useScoreboardData } from "../hooks/use-scoreboard-data";
import type { GameRouteParams } from "../types/game";

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
        <TableRow>
          <For each={Array(props.numCols)}>
            {() => (
              <TableCell>
                <LoadingText />
              </TableCell>
            )}
          </For>
        </TableRow>
      )}
    </For>
  );
};

type SortProp = "name" | "win_rate" | "average_score";

const DEFAULT_SORT: Sort<SortProp> = {
  property: "win_rate",
  direction: "descending",
};

export const Scoreboard = () => {
  const params = useParams<GameRouteParams>();

  const [sort, setSort] = createSignal<Sort<SortProp>>(DEFAULT_SORT);
  const scoreboardData = useScoreboardData(() => params.gameId, sort);
  const navigate = useNavigate();

  const tableHeadings = [
    { label: "No." },
    { label: "Name", sortProp: "name" },
    { label: "Win Rate", sortProp: "win_rate", defaultDirection: "descending" },
    {
      label: "Points/Game",
      sortProp: "average_score",
      defaultDirection: "descending",
    },
  ] as const satisfies Heading<string>[];

  // TODO: proper loading for scoreboard name
  return (
    <Page
      title={scoreboardData.data?.game.name ?? "Loading"}
      actions={[
        {
          text: "Record Match",
          variant: "primary",
          onAction: () => navigate(`record`),
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
            <For each={scoreboardData.data?.entries?.slice(0, 3)}>
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
          sortedBy={sort()}
          onSort={setSort}
          headings={tableHeadings}
          caption="Stats of all players playing this game"
        >
          <Suspense fallback={<LoadingRows numCols={4} />}>
            <For each={scoreboardData.data?.entries}>
              {(score, index) => (
                <TableRow onClick={() => navigate(`player/${score.user_id}`)}>
                  <TableCell>
                    <span class="text-gray-400">{index() + 1}</span>
                  </TableCell>
                  <TableCell>{score.user_name}</TableCell>
                  <TableCell>
                    <span class="flex w-48 min-w-16 items-center">
                      <ProgressBar percentage={score.win_rate * 100} />
                      <span class="w-18 min-w-10 text-right">
                        {(score.win_rate * 100).toFixed(0)}%
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>{score.average_score.toFixed(2)}</TableCell>
                </TableRow>
              )}
            </For>
          </Suspense>
        </Table>
      </div>
    </Page>
  );
};
