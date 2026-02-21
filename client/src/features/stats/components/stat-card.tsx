import type { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { TextSkeleton } from "@/components/ui/text.skeleton";
import { cn } from "@/lib/classname";
import { ICON_MAP, type Icon } from "@/lib/icons";
import { COLOUR_MAP, type Colour } from "../constants";

type Props = {
  icon: Icon;
  colour: Colour;
  label: string;
  stat?: string;
  loading?: boolean;
};

export const StatCard: Component<Props> = (props) => {
  return (
    <div
      class={cn(
        "flex h-28 w-74 min-w-74 items-center gap-4 rounded-md border px-4 py-2",
        COLOUR_MAP[props.colour].bg,
        COLOUR_MAP[props.colour].text,
        COLOUR_MAP[props.colour].border,
      )}
    >
      <div class={cn("m-2 rounded-full p-4", COLOUR_MAP[props.colour].bgDark)}>
        <Dynamic component={ICON_MAP[props.icon]} size={40} />
      </div>
      <div>
        <p
          class={cn(
            "font-semibold text-sm",
            COLOUR_MAP[props.colour].textSubtle,
          )}
        >
          {props.label}
        </p>
        <span class="font-mono-nums font-semibold text-3xl">
          {props.loading ? (
            <TextSkeleton class="w-18 pt-1" />
          ) : (
            <p>{props.stat}</p>
          )}
        </span>
      </div>
    </div>
  );
};
