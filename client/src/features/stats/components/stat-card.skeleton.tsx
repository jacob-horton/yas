import type { Component } from "solid-js";

type Props = {
  label: string;
};

export const StatCardSkeleton: Component<Props> = (props) => {
  return (
    <div class="flex h-28 w-40 animate-pulse flex-col items-center justify-center gap-2 rounded-md border px-4 py-2 text-center">
      <div class="my-1 flex h-9 w-1/2 items-center rounded-md bg-gray-200" />
      <p class="font-normal text-gray-400 text-sm">{props.label}</p>
    </div>
  );
};
