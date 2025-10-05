import { For } from 'solid-js';
import { Page } from '../components/page';
import { ProgressBar } from '../components/progress-bar';
import { Table } from '../components/table';
import { createAsync, query } from '@solidjs/router';
import { Suspense } from 'solid-js';
import type { Component } from 'solid-js';

export const getGroupScores = query(async () => {
  const res = await fetch('http://localhost:8080/api/group/scores');
  if (!res.ok) {
    throw new Error('Failed to fetch group scores');
  }

  return res.json();
}, 'groupScores');

const LoadingText = () => {
  return (
    <div class="bg-gray-200 rounded-sm animate-pulse w-full h-[1em] inline-block" />
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
                  <span class="w-32 flex items-center">
                    <ProgressBar percentage={score.win_percent} />
                    <span class="text-right w-18 min-w-10">
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
