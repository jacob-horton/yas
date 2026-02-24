import type { Component, ParentComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/classname";

type Props = {
  title: string;
  img?: Component<{ class?: string }>;
  class?: string;
};

export const EmptyState: ParentComponent<Props> = (props) => {
  return (
    <div class="flex w-full flex-col items-center justify-center gap-12 px-16 py-16">
      <div class="flex items-center justify-center text-violet-500">
        <Dynamic component={props.img} class="h-80" />
      </div>
      <div class="flex flex-col items-center gap-4">
        <h2 class="font-semibold text-4xl">{props.title}</h2>
        <div class={cn("flex flex-col items-center", props.class)}>
          {props.children}
        </div>
      </div>
    </div>
  );
};
