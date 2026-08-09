import { Menu as ArkMenu } from "@ark-ui/solid";
import CheckIcon from "lucide-solid/icons/check";
import { For, Portal, Show } from "solid-js/web";
import { Button } from "./button";
import { cn } from "@/lib/classname";
import { ChevronDownIcon } from "lucide-solid";

export type MenuOption = {
  onClick: () => void;
  label: string;
  value: string;
};

export type MenuProps = {
  options: MenuOption[];
  disabled?: boolean;
  value: string;
  text: string;
};

export function Menu(props: MenuProps) {
  return (
    <ArkMenu.Root>
      <ArkMenu.Trigger
        disabled={props.disabled}
        class={cn(
          "relative flex h-8 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border py-1 ps-5 pe-3 font-semibold transition hover:bg-gray-100 focus-visible:outline-none dark:hover:bg-gray-100/10",
          {
            "cursor-not-allowed bg-gray-100 bg-gray-300 hover:bg-gray-100 hover:bg-gray-300":
              props.disabled,
          },
        )}
      >
        {props.text}
        <ChevronDownIcon size={18} />
      </ArkMenu.Trigger>

      <Portal>
        <ArkMenu.Positioner>
          <ArkMenu.Content class="z-50 min-w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg focus-visible:outline-none">
            <For each={props.options}>
              {(option) => (
                <ArkMenu.Item
                  value={option.value}
                  class="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm data-[highlighted]:bg-gray-100"
                  onClick={option.onClick}
                >
                  <ArkMenu.ItemText>{option.label}</ArkMenu.ItemText>

                  <Show when={props.value === option.value}>
                    <CheckIcon size={14} />
                  </Show>
                </ArkMenu.Item>
              )}
            </For>
          </ArkMenu.Content>
        </ArkMenu.Positioner>
      </Portal>
    </ArkMenu.Root>
  );
}
