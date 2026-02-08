import { type Component, Index } from "solid-js";
import { cn } from "@/lib/classname";

export const TextSkeleton: Component<{ class?: string; lines?: number }> = (
  props,
) => {
  const lines = props.lines ?? 1;
  return (
    <div class="flex flex-col gap-2.5 w-full">
      <Index each={Array.from({ length: lines })}>
        {(_, i) => (
          <div
            class={cn(
              "h-4 w-full animate-pulse rounded-md bg-gray-200",
              { "w-2/3": lines > 1 && i >= lines - 1 },
              props.class,
            )}
          />
        )}
      </Index>
    </div>
  );
};
