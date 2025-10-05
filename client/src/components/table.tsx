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
    <div
      class="w-full overflow-clip rounded-lg border border-gray-300 bg-white shadow-md"
      aria-labelledby={captionId}
      role="group"
    >
      <table class="w-full table-auto divide-y divide-gray-300">
        <caption id={captionId} class="sr-only">
          {props.caption}
        </caption>
        <thead class="text-sm tracking-wider text-gray-500 uppercase">
          <tr>
            <For each={props.headings}>
              {(heading) => (
                <th
                  scope="col"
                  class="bg-gray-100 px-4 py-2 text-left align-middle font-normal"
                >
                  {heading}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300 text-gray-700">
          {props.children}
        </tbody>
      </table>
    </div>
  );
};

export const Row: ParentComponent = (props) => {
  return <tr class="even:bg-gray-50">{props.children}</tr>;
};

export const Cell: ParentComponent = (props) => {
  return <td class="px-4 py-2">{props.children}</td>;
};

Table.Row = Row;
Table.Cell = Cell;
