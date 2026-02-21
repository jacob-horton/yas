import type { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { TextSkeleton } from "@/components/ui/text.skeleton";
import { cn } from "@/lib/classname";
import { ICON_MAP, type Icon } from "@/lib/icons";
import { COLOUR_MAP } from "../constants";

type Props = {
  icon: Icon;
  colour: keyof typeof COLOUR_MAP;
  label: string;
  subtext: string;
  userName: string;
  value: string;
  loading?: boolean;
};

export const HighlightStatCard: Component<Props> = (props) => {
  return (
    <div
      class={cn(
        "flex h-28 w-80 min-w-80 items-center gap-4 rounded-md border px-4 py-2",
        COLOUR_MAP[props.colour].bg,
        COLOUR_MAP[props.colour].text,
        COLOUR_MAP[props.colour].border,
      )}
    >
      <div class={cn("m-2 rounded-full p-4", COLOUR_MAP[props.colour].bgDark)}>
        <Dynamic component={ICON_MAP[props.icon]} size={40} />
      </div>

      <div class="flex w-full flex-col items-stretch justify-center gap-2">
        <div>
          <p class="whitespace-nowrap font-semibold text-xl leading-5">
            {props.label}
          </p>
          <p
            class={cn(
              "whitespace-nowrap font-normal text-gray-400 text-xs",
              COLOUR_MAP[props.colour].textSubtle,
            )}
          >
            {props.subtext}
          </p>
        </div>

        <div class="flex items-center justify-between">
          {props.loading ? (
            <>
              <TextSkeleton class="w-18" />
              <TextSkeleton class="w-8" />
            </>
          ) : (
            <>
              <p class="font-semibold">{props.userName}</p>
              <p>{props.value}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
