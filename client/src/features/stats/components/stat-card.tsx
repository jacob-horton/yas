import ChartColumnIcon from "lucide-solid/icons/chart-column";
import HashIcon from "lucide-solid/icons/hash";
import Layers2Icon from "lucide-solid/icons/layers-2";
import StarIcon from "lucide-solid/icons/star";
import TrophyIcon from "lucide-solid/icons/trophy";
import type { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { TextSkeleton } from "@/components/ui/text.skeleton";
import { cn } from "@/lib/classname";

const COLOUR_MAP = {
  orange: {
    text: "text-orange-500",
    textSubtle: "text-orange-400",
    bg: "bg-orange-50/50 dark:bg-orange-500/10",
    bgDark: "bg-orange-100/75 dark:bg-orange-200/10",
    border: "border-orange-200 dark:border-orange-500/30",
  },
  green: {
    text: "text-emerald-500",
    textSubtle: "text-emerald-400",
    bg: "bg-emerald-50/50 dark:bg-emerald-500/10",
    bgDark: "bg-emerald-100/75 dark:bg-emerald-200/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  purple: {
    text: "text-violet-500",
    textSubtle: "text-violet-400",
    bg: "bg-violet-50/50 dark:bg-violet-500/10",
    bgDark: "bg-violet-100/75 dark:bg-violet-200/10",
    border: "border-violet-200 dark:border-violet-500/30",
  },
  blue: {
    text: "text-blue-500",
    textSubtle: "text-blue-400",
    bg: "bg-blue-50/50 dark:bg-blue-500/10",
    bgDark: "bg-blue-100/75 dark:bg-blue-200/10",
    border: "border-blue-200 dark:border-blue-500/30",
  },
  yellow: {
    text: "text-yellow-600",
    textSubtle: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    bgDark: "bg-yellow-100 dark:bg-yellow-200/10",
    border: "border-yellow-300 dark:border-yellow-500/30",
  },
} as const;

const ICON_MAP = {
  trophy: TrophyIcon,
  star: StarIcon,
  chart: ChartColumnIcon,
  stack: Layers2Icon,
  hash: HashIcon,
} as const;

export type Icon = keyof typeof ICON_MAP;
export type Colour = keyof typeof COLOUR_MAP;

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
