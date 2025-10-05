import { createAsync, query } from '@solidjs/router';
import type { Component } from 'solid-js';
import { For, Suspense } from 'solid-js';
import { Page } from '../components/page';
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
      <Table
        headings={[<></>, 'Name', 'Win Percentage', 'Points per Game']}
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
                  <span class="flex w-32 items-center">
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
    </Page>
  );
};
