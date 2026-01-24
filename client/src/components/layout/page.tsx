import { For, type ParentComponent } from "solid-js";
import { cn } from "@/lib/classname";
import { Button, type Variant } from "../ui/button";

type Props = {
  title: string;
  actions?: {
    variant: Variant;
    text: string;
    onAction: () => void;
  }[];
  narrow?: boolean;
};

export const Page: ParentComponent<Props> = (props) => {
  return (
    <div
      class={cn("mx-auto h-full w-full max-w-7xl px-4", {
        "max-w-3xl": props.narrow,
      })}
    >
      <header class="flex items-center justify-between">
        <h1 class="py-6 font-semibold text-3xl text-gray-800">{props.title}</h1>
        <For each={props.actions ?? []}>
          {(action) => (
            <Button onClick={action.onAction} variant={action.variant}>
              {action.text}
            </Button>
          )}
        </For>
      </header>
      <div>{props.children}</div>
    </div>
  );
};
