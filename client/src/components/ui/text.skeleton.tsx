import { type Component, Index } from "solid-js";
import { cn } from "@/lib/classname";

export const TextSkeleton: Component<{ class?: string; lines?: number }> = (
  props,
) => {
  const lines = props.lines ?? 1;
  return (
    <div class="flex flex-col gap-2.5">
      <Index each={Array.from({ length: lines })}>
        {(_, i) => (
          <div
            class={cn(
              "h-4 w-56 animate-pulse rounded-md bg-gray-200",
              { "w-42": lines > 1 && i >= lines - 1 },
              props.class,
            )}
          />
        )}
      </Index>
    </div>
  );
};
