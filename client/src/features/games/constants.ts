export const SCORING_METRIC_LABELS = {
  win_rate: "Win rate",
  average_score: "Average score",
};

// TODO: reduce duplication with other stat card
// TODO: tidy up names
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
} as const;

export const RANK_PODIUM_SIZES: Record<number, string> = {
  1: "h-80 text-4xl",
  2: "h-72 text-3xl",
  3: "h-68 text-2xl",
};
