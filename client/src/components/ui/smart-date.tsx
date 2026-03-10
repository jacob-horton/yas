import {
  addDays,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  subDays,
} from "date-fns";
import { type Component, createMemo, createSignal, onCleanup } from "solid-js";
import { cn } from "@/lib/classname";
import { Tooltip } from "./tooltip";

export type DateStrategy = "smart" | "absolute" | "relative";

export const getDisplayDate = (
  date: Date,
  strategy: DateStrategy = "smart",
) => {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const sevenDaysFromNow = addDays(now, 7);

  if (strategy === "absolute") {
    return format(date, "MMM d, yyyy");
  }

  if (strategy === "smart") {
    const isWayInPast = isBefore(date, sevenDaysAgo);
    const isWayInFuture = isAfter(date, sevenDaysFromNow);

    if (isWayInPast || isWayInFuture) {
      return format(date, "MMM d, yyyy");
    }
  }

  return formatDistanceToNow(date, { addSuffix: true });
};

type SmartDateProps = {
  date: Date | string;
  strategy?: DateStrategy;
  class?: string;
};

export const SmartDate: Component<SmartDateProps> = (props) => {
  const dateObj = createMemo(() =>
    typeof props.date === "string" ? new Date(props.date) : props.date,
  );

  const [now, setNow] = createSignal(Date.now());
  const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
  onCleanup(() => clearInterval(timer));

  const displayValue = createMemo(() => {
    now();
    return getDisplayDate(dateObj(), props.strategy);
  });

  const fullTimestamp = createMemo(() => format(dateObj(), "PPPP 'at' p"));
  const isoString = createMemo(() => dateObj().toISOString());

  return (
    <Tooltip tooltip={fullTimestamp()}>
      <time
        datetime={isoString()}
        class={cn(
          "underline decoration-gray-400 decoration-dotted underline-offset-4",
          props.class,
        )}
      >
        {displayValue()}
      </time>
    </Tooltip>
  );
};
