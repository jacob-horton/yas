import type { Component } from "solid-js";
import { TextSkeleton } from "@/components/ui/text.skeleton";

export const HighlightStatCardSkeleton: Component = () => {
  return (
    <div class="flex h-28 flex-1 items-center justify-center rounded-md border px-4 py-2">
      <TextSkeleton lines={3} />
    </div>
  );
};
