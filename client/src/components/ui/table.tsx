import { createUniqueId, For, type ParentComponent } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { cn } from "@/lib/classname";

export type TableProps = {
  headings: JSX.Element[];
  caption: string;
};

export type TableRowProps = {
  onClick?: () => void;
};

type TableComponent = ParentComponent<TableProps> & {
  Row: ParentComponent<TableRowProps>;
  Cell: ParentComponent;
};

export const Table: TableComponent = (props) => {
  const captionId = createUniqueId();

  return (
    <table class="w-full" aria-labelledby={captionId}>
      <caption id={captionId} class="sr-only">
        {props.caption}
      </caption>
      <thead>
        <tr>
          <For each={props.headings}>
            {(heading, i) => (
              <th
                scope="col"
                class={cn("bg-gray-100 px-5 py-3 text-start font-semibold", {
                  "rounded-s-md": i() === 0,
                  "rounded-e-md": i() === props.headings.length - 1,
                })}
              >
                {heading}
              </th>
            )}
          </For>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">{props.children}</tbody>
    </table>
  );
};

export const Row: ParentComponent<TableRowProps> = (props) => {
  return (
    <tr
      class={cn({
        "cursor-pointer transition hover:bg-gray-50": props.onClick,
      })}
      onClick={props.onClick}
    >
      {props.children}
    </tr>
  );
};

export const Cell: ParentComponent = (props) => {
  return <td class="px-5 py-3">{props.children}</td>;
};

Table.Row = Row;
Table.Cell = Cell;
