import { useNavigate, useParams } from "@solidjs/router";
import { createMemo, createSignal, For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import {
  type Heading,
  type Sort,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { useAuth } from "@/features/auth/context/auth-provider";
import { cn } from "@/lib/classname";
import { PodiumCard, PodiumCardSkeleton } from "../components/podium-card";
import { ProgressBar } from "../components/progress-bar";
import { useScoreboardData } from "../hooks/use-scoreboard-data";
import type { GameRouteParams } from "../types/game";

const TABLE_CAPTION = "Stats of all players playing this game";

type SortProp = "win_rate" | "average_score";
const DEFAULT_SORT: Sort<SortProp> = {
  property: "win_rate",
  direction: "descending",
};

export const Scoreboard = () => {
  const params = useParams<GameRouteParams>();
  const auth = useAuth();
  const userId = () => auth.user()?.id;

  const [sort, setSort] = createSignal<Sort<SortProp>>(DEFAULT_SORT);
  const scoreboardData = useScoreboardData(() => params.gameId, sort);
  const navigate = useNavigate();

  const tableHeadings = [
    { label: "No.", class: "w-12" },
    { label: "Name" },
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
            <For each={scoreboardData.data?.podium}>
              {(score, index) => (
                <PodiumCard
                  avatar={score.user_avatar}
                  avatarColour={score.user_avatar_colour}
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
          caption={TABLE_CAPTION}
        >
          <Suspense fallback={<TableRowSkeleton numCols={4} />}>
            <For each={scoreboardData.data?.entries}>
              {(score, index) => (
                <TableRow
                  onClick={() => navigate(`player/${score.user_id}`)}
                  class={cn({
                    "font-semibold": score.user_id === userId(),
                  })}
                >
                  <TableCell>
                    <span
                      class={cn(
                        score.user_id === userId()
                          ? "font-bold text-gray-600"
                          : "text-gray-400",
                      )}
                    >
                      {index() + 1}
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
                    <span class="flex w-64 min-w-16 items-center">
                      <ProgressBar percentage={score.win_rate * 100} />
                      <span class="w-20 min-w-10 text-right">
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
