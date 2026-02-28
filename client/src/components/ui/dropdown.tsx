import { createListCollection, Select } from "@ark-ui/solid";
import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import { type Component, createMemo, For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "@/lib/classname";

export const Dropdown: Component<{
  class?: string;
  label: string;
  value: string;
  fallback?: string;
  options: { label: string; value: string; disabled?: boolean }[];
  onChange: (value: string) => void;
  error?: string;
}> = (props) => {
  const collection = createMemo(() =>
    createListCollection({
      items: props.options,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  );

  return (
    <Select.Root
      collection={collection()}
      value={[props.value]}
      onValueChange={(details) => props.onChange(details.value[0])}
      disabled={props.options.length === 0}
      invalid={!!props.error}
      positioning={{
        gutter: 4,
        sameWidth: true,
        placement: "bottom",
      }}
      class={cn(
        "flex h-min max-w-96 flex-1 flex-col gap-1 transition",
        props.class,
      )}
    >
      <Select.Trigger
        class={cn(
          "group flex h-16 w-full items-center rounded-md border text-left font-semibold outline-none transition",
          {
            "data-[focus]:border-violet-500 data-[state=open]:border-violet-500":
              !props.error,
            "border-red-300 bg-red-100 text-red-500 data-[focus]:border-red-500 data-[state=open]:border-red-500":
              !!props.error,
          },
        )}
      >
        <div
          class={cn("h-full w-2 rounded-l-sm transition", {
            "group-data-[focus]:bg-violet-500 group-data-[state=open]:bg-violet-500":
              !props.error,
            "group-data-[focus]:bg-red-500 group-data-[state=open]:bg-red-500":
              !!props.error,
          })}
        />

        <div class="flex flex-1 flex-col justify-center overflow-hidden px-3 py-2">
          <Select.Label
            class={cn("text-gray-400 text-xs transition", {
              "text-red-400": !!props.error,
            })}
          >
            {props.label}
          </Select.Label>

          <div class="flex items-center justify-between gap-2">
            <Select.ValueText
              class="truncate"
              placeholder={props.fallback ?? "Select an option"}
            />
            <Select.Indicator>
              <ChevronDownIcon
                size={18}
                class={cn(
                  "text-gray-500 transition-transform group-data-[state=open]:rotate-180",
                  { "text-red-400": !!props.error },
                )}
              />
            </Select.Indicator>
          </div>
        </div>
      </Select.Trigger>

      <Portal>
        <Select.Positioner>
          <Select.Content class="z-10 w-full overflow-y-auto rounded-md border bg-white shadow-lg outline-none dark:bg-gray-900">
            <For each={collection().items}>
              {(item) => (
                <Select.Item
                  item={item}
                  class={cn(
                    "cursor-pointer px-3 py-2 outline-none transition",
                    "data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-200/10",
                    "aria-selected:font-semibold",
                    "data-[disabled]:cursor-not-allowed data-[disabled]:text-gray-400 dark:data-[disabled]:text-gray-500",
                  )}
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                </Select.Item>
              )}
            </For>
            <Show when={props.options.length === 0}>
              <div class="px-3 py-2 text-gray-400">
                {props.fallback ?? "No options available"}
              </div>
            </Show>
          </Select.Content>
        </Select.Positioner>
      </Portal>

      <Show when={props.error}>
        <span class="flex items-center gap-1 text-red-500 text-sm">
          <CircleAlertIcon class="size-4" />
          <p>{props.error}</p>
        </span>
      </Show>
    </Select.Root>
  );
};
