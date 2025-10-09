import { createUniqueId, For, type ParentComponent } from 'solid-js';
import type { JSX } from 'solid-js/jsx-runtime';

export type TableProps = {
  headings: JSX.Element[];
  caption: string;
};

type TableComponent = ParentComponent<TableProps> & {
  Row: ParentComponent;
  Cell: ParentComponent;
};

export const Table: TableComponent = (props) => {
  const captionId = createUniqueId();

  return (
    <div class="w-full" aria-labelledby={captionId} role="group">
      <table class="w-full">
        <caption id={captionId} class="sr-only">
          {props.caption}
        </caption>
        <thead>
          <tr>
            <For each={props.headings}>
              {(heading, i) => (
                <th
                  scope="col"
                  class="bg-gray-100 px-5 py-3 text-start font-semibold"
                  classList={{
                    'rounded-s-md': i() === 0,
                    'rounded-e-md': i() === props.headings.length - 1,
                  }}
                >
                  {heading}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">{props.children}</tbody>
      </table>
    </div>
  );
};

export const Row: ParentComponent = (props) => {
  return <tr>{props.children}</tr>;
};

export const Cell: ParentComponent = (props) => {
  return <td class="px-5 py-3">{props.children}</td>;
};

Table.Row = Row;
Table.Cell = Cell;
