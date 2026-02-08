import type { Component } from "solid-js";

type Props = {
  // icon:
  label: string;
  subtext: string;
  userName: string;
  value: string;
};

export const HighlightStatCard: Component<Props> = (props) => {
  return (
    <div class="flex h-28 flex-1 flex-col items-center justify-center rounded-md border px-4 py-2 text-center">
      <p class="whitespace-nowrap font-mono-nums font-semibold text-xl">
        {props.label}
      </p>
      <p class="whitespace-nowrap font-normal text-gray-400 text-xs">
        {props.subtext}
      </p>
      <p class="font-normal text-gray-400 text-sm">{props.userName}</p>
      <p class="font-normal text-gray-400 text-sm">{props.value}</p>
    </div>
  );
};
