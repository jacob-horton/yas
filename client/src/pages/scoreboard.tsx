import { createAsync, query } from '@solidjs/router';
import type { Component } from 'solid-js';
import { For, Suspense } from 'solid-js';
import { Page } from '../components/page';
import { PodiumCard, PodiumCardSkeleton } from '../components/podium-card';
import { ProgressBar } from '../components/progress-bar';
import { Table } from '../components/table';

export const getGroupScores = query(async () => {
  const res = await fetch('http://localhost:8080/api/group/scores');
  if (!res.ok) {
    throw new Error('Failed to fetch group scores');
  }

  return res.json();
}, 'groupScores');

const LoadingText = () => {
  return (
    <div class="inline-block h-[1em] w-full animate-pulse rounded-sm bg-gray-200" />
  );
};

const LoadingRows: Component<{ numCols: number; numRows?: number }> = (
  props
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
  const scores = createAsync(() => getGroupScores());

  return (
    <Page title="Scoreboard">
      <div class="flex flex-col gap-6">
        <div class="flex gap-6">
          <Suspense
            fallback={
              <For each={Array(3)}>
                {(_, index) => <PodiumCardSkeleton position={index() + 1} />}
              </For>
            }
          >
            <For each={scores()?.slice(0, 3)}>
              {(score, index) => (
                <PodiumCard
                  name={score.name}
                  winRate={score.win_percent}
                  pointsPerGame={score.points_per_game}
                  position={index() + 1}
                />
              )}
            </For>
          </Suspense>
        </div>
        <Table
          headings={['No.', 'Name', 'Win Rate', 'Points/Game']}
          caption="table"
        >
          <Suspense fallback={<LoadingRows numCols={4} />}>
            <For each={scores()}>
              {(score, index) => (
                <Table.Row>
                  <Table.Cell>
                    <span class="text-gray-400">{index() + 1}</span>
                  </Table.Cell>
                  <Table.Cell>{score.name}</Table.Cell>
                  <Table.Cell>
                    <span class="flex w-48 min-w-16 items-center">
                      <ProgressBar percentage={score.win_percent} />
                      <span class="w-18 min-w-10 text-right">
                        {score.win_percent}%
                      </span>
                    </span>
                  </Table.Cell>
                  <Table.Cell>{score.points_per_game}</Table.Cell>
                </Table.Row>
              )}
            </For>
          </Suspense>
        </Table>
      </div>
    </Page>
  );
};
