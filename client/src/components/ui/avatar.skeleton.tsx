import type { Component } from "solid-js";
import { cn } from "@/lib/classname";

export const AvatarSkeleton: Component<{ class?: string }> = (props) => {
  return (
    <div
      class={cn("size-5 animate-pulse rounded-full bg-gray-300", props.class)}
    />
  );
};
