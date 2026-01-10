import { For, type ParentComponent } from "solid-js";
import { Button, type Variant } from "./button";

type Props = {
  title: string;
  actions?: {
    variant: Variant;
    text: string;
    onAction: () => void;
  }[];
};

export const Page: ParentComponent<Props> = (props) => {
  return (
    <div class="mx-auto h-full w-full max-w-6xl px-4">
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
