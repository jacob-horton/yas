import ArrowDownIcon from "lucide-solid/icons/arrow-down";
import ArrowUpIcon from "lucide-solid/icons/arrow-up";
import ArrowUpDownIcon from "lucide-solid/icons/arrow-up-down";
import {
  type Component,
  createUniqueId,
  For,
  Match,
  type ParentComponent,
  type ParentProps,
  Switch,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { cn } from "@/lib/classname";

export type SortDirection = "ascending" | "descending";

export type Heading<T extends string> = {
  label: JSX.Element;
  sortProp?: T;
  defaultDirection?: SortDirection;
};

export type Sort<T extends string> = {
  property: T;
  direction: SortDirection;
};

export type TableProps<T extends string> = ParentProps<{
  headings: Heading<T>[];
  sortedBy?: Sort<T>;
  onSort?: (sort: Sort<T>) => void;
  caption: string;
}>;

export type TableRowProps = {
  onClick?: () => void;
  class?: string;
};

const SORT_ICON_SIZE = 14;

type SortIconProps = {
  direction?: SortDirection;
};

const SortIcon: Component<SortIconProps> = (props) => {
  return (
    <Switch
      fallback={<ArrowUpDownIcon size={SORT_ICON_SIZE} class="text-gray-400" />}
    >
      <Match when={props.direction === "ascending"}>
        <ArrowUpIcon size={SORT_ICON_SIZE} />
      </Match>
      <Match when={props.direction === "descending"}>
        <ArrowDownIcon size={SORT_ICON_SIZE} />
      </Match>
    </Switch>
  );
};

export function Table<T extends string>(props: TableProps<T>) {
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
                <div class="flex items-center gap-2">
                  {heading.label}
                  {heading.sortProp && (
                    <button
                      type="button"
                      class="cursor-pointer rounded-md p-1 hover:bg-black/5"
                      onClick={() => {
                        const isActive =
                          heading.sortProp === props.sortedBy?.property;
                        const currentDir = props.sortedBy?.direction;

                        const defaultDirection =
                          heading.defaultDirection ?? "ascending";
                        const nextDirection = isActive
                          ? currentDir === "ascending"
                            ? "descending"
                            : "ascending"
                          : defaultDirection;

                        props.onSort?.({
                          // biome-ignore lint/style/noNonNullAssertion: This component won't render if sortProp isn't defined
                          property: heading.sortProp!,
                          direction: nextDirection,
                        });
                      }}
                    >
                      <SortIcon
                        direction={
                          heading.sortProp === props.sortedBy?.property
                            ? props.sortedBy?.direction
                            : undefined
                        }
                      />
                    </button>
                  )}
                </div>
              </th>
            )}
          </For>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">{props.children}</tbody>
    </table>
  );
}

export const TableRow: ParentComponent<TableRowProps> = (props) => {
  return (
    <tr
      class={cn(
        { "cursor-pointer transition hover:bg-gray-50": props.onClick },
        props.class,
      )}
      onClick={props.onClick}
    >
      {props.children}
    </tr>
  );
};

export const TableCell: ParentComponent = (props) => {
  return <td class="whitespace-nowrap px-5 py-3">{props.children}</td>;
};
