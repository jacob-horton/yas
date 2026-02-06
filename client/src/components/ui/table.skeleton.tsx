import { type Component, For } from "solid-js";
import { TableCell, TableRow } from "./table";

export const TableRowSkeleton: Component<{
  numCols: number;
  numRows?: number;
}> = (props) => {
  return (
    <For each={Array(props.numRows ?? 5)}>
      {() => (
        <TableRow>
          <For each={Array(props.numCols)}>
            {() => (
              <TableCell>
                <div class="inline-block h-[1em] w-full animate-pulse rounded-sm bg-gray-200" />
              </TableCell>
            )}
          </For>
        </TableRow>
      )}
    </For>
  );
};
