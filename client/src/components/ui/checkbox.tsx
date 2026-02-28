import { Checkbox as ArkCheckbox } from "@ark-ui/solid";
import type { Component } from "solid-js";
import { cn } from "@/lib/classname";

export type Props = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  class?: string;
};

export const Checkbox: Component<Props> = (props) => {
  return (
    <ArkCheckbox.Root
      checked={props.checked}
      onCheckedChange={({ checked }) => {
        if (typeof checked === "string") {
          return;
        }

        props.onCheckedChange?.(checked);
      }}
      class={cn("flex items-center justify-center", props.class)}
    >
      <ArkCheckbox.Control class="flex size-4 cursor-pointer items-center justify-center rounded border border-gray-300 bg-white transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b51e0] focus-visible:ring-offset-2 data-[state=checked]:border-[#9b51e0] data-[state=checked]:bg-[#9b51e0]">
        <ArkCheckbox.Indicator class="flex items-center justify-center">
          <svg
            class="size-2.5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            {/* Adjusted points for better centering in a small box */}
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>

      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
};
