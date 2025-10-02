import { For } from 'solid-js';
import { Page } from '../components/page';
import { ProgressBar } from '../components/progress-bar';
import { Table } from '../components/table';

export const Scoreboard = () => {
  const dummyScores = [
    { name: 'Jane', win_percent: 45, points_per_game: 56.78 },
    { name: 'John', win_percent: 30, points_per_game: 12.34 },
    { name: 'Bill', win_percent: 20, points_per_game: 5.55 },
    { name: 'Alex', win_percent: 15, points_per_game: 4.44 },
  ];

  return (
    <Page title="Scoreboard">
      <Table
        headings={[<></>, 'Name', 'Win Percentage', 'Points per Game']}
        caption="table"
      >
        <For each={dummyScores}>
          {(score, index) => (
            <Table.Row id="1" shadedBackground={index() % 2 === 1}>
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
      </Table>
    </Page>
  );
};
