import CrownIcon from "lucide-solid/icons/crown";
import InfinityIcon from "lucide-solid/icons/infinity";
import MountainIcon from "lucide-solid/icons/mountain-snow";
import WheatIcon from "lucide-solid/icons/wheat";
import type { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/classname";

// TODO: reduce duplication with other stat card
const COLOUR_MAP = {
  orange: {
    text: "text-amber-500",
    textSubtle: "text-ember-400",
    bg: "bg-amber-50/50",
    bgDark: "bg-amber-100/75",
    border: "border-amber-200",
  },
  green: {
    text: "text-emerald-500",
    textSubtle: "text-emerald-400",
    bg: "bg-emerald-50/50",
    bgDark: "bg-emerald-100/75",
    border: "border-emerald-200",
  },
  purple: {
    text: "text-violet-500",
    textSubtle: "text-violet-400",
    bg: "bg-violet-50/50",
    bgDark: "bg-violet-100/75",
    border: "border-violet-200",
  },
  blue: {
    text: "text-blue-500",
    textSubtle: "text-blue-400",
    bg: "bg-blue-50/50",
    bgDark: "bg-blue-100/75",
    border: "border-blue-200",
  },
} as const;

const ICON_MAP = {
  crown: CrownIcon,
  wheat: WheatIcon,
  mountain: MountainIcon,
  infinity: InfinityIcon,
} as const;

type Props = {
  icon: keyof typeof ICON_MAP;
  colour: keyof typeof COLOUR_MAP;
  label: string;
  subtext: string;
  userName: string;
  value: string;
};

export const HighlightStatCard: Component<Props> = (props) => {
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
          <p class="font-semibold">{props.userName}</p>
          <p>{props.value}</p>
        </div>
      </div>
    </div>
  );
};
