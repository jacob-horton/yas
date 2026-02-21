import { ordinalSuffix } from "@/lib/ordinal-suffix";
import type { StatData } from "./types";

function getTailwindColour(name: string, shade = "400"): string {
  const variableName = `--color-${name}-${shade}`;
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue(variableName)?.trim();
}

export type ColourKey = keyof typeof TAILWIND_COLOUR_MAP;

export const TAILWIND_COLOUR_MAP = {
  red: getTailwindColour("red", "400"),
  orange: getTailwindColour("orange", "400"),
  amber: getTailwindColour("amber", "400"),
  yellow: getTailwindColour("yellow", "400"),
  lime: getTailwindColour("lime", "400"),
  green: getTailwindColour("green", "400"),
  emerald: getTailwindColour("emerald", "400"),
  teal: getTailwindColour("teal", "400"),
  cyan: getTailwindColour("cyan", "400"),
  sky: getTailwindColour("sky", "400"),
  blue: getTailwindColour("blue", "400"),
  indigo: getTailwindColour("indigo", "400"),
  violet: getTailwindColour("violet", "400"),
  purple: getTailwindColour("purple", "400"),
  fuchsia: getTailwindColour("fuchsia", "400"),
  pink: getTailwindColour("pink", "400"),
  rose: getTailwindColour("rose", "400"),
  slate: getTailwindColour("slate", "400"),
} as const;

export const CHART_LINE_COLOUR = "oklch(54.1% 0.281 293.009)";

export const COLOUR_MAP = {
  orange: {
    text: "text-amber-500",
    textSubtle: "text-amber-400",
    bg: "bg-amber-50/50 dark:bg-amber-500/10",
    bgDark: "bg-amber-100/75 dark:bg-amber-200/10",
    border: "border-amber-200 dark:border-amber-500/30",
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
    text: "text-fuchsia-500",
    textSubtle: "text-fuchsia-400",
    bg: "bg-fuchsia-50/50 dark:bg-fuchsia-500/10",
    bgDark: "bg-fuchsia-100/75 dark:bg-fuchsia-200/10",
    border: "border-fuchsia-200 dark:border-fuchsia-500/30",
  },
} as const;

export type Colour = keyof typeof COLOUR_MAP;

export const LIFETIME_STATS: StatData[] = [
  {
    icon: "trophy",
    colour: "orange",
    label: "Win Rate",
    getValue: (d) => `${(d.lifetime.win_rate * 100).toFixed(0)}%`,
  },
  {
    icon: "chart",
    colour: "green",
    label: "Average Score",
    getValue: (d) => d.lifetime.average_score.toFixed(2),
  },
  {
    icon: "star",
    colour: "purple",
    label: "Best Score",
    getValue: (d) => d.lifetime.best_score.toFixed(0),
  },
  {
    icon: "stack",
    colour: "blue",
    label: "Total Games",
    getValue: (d) => d.lifetime.total_games.toFixed(0),
  },
  {
    icon: "hash",
    colour: "yellow",
    label: "Current Rank",
    getValue: (d) => ordinalSuffix(d.lifetime.rank),
  },
];
