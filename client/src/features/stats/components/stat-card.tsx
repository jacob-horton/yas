import type { Component } from "solid-js";

type Props = {
  label: string;
  stat: string;
};

export const StatCard: Component<Props> = (props) => {
  return (
    <div class="flex h-28 w-40 flex-col items-center justify-center gap-2 rounded-md border px-4 py-2 text-center">
      <p class="font-mono-nums font-semibold text-3xl">{props.stat}</p>
      <p class="font-normal text-gray-400 text-sm">{props.label}</p>
    </div>
  );
};
