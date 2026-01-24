import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import { For, type ParentComponent, Show } from "solid-js";
import { cn } from "@/lib/classname";
import { Button, type Variant } from "../ui/button";
import { useNavigate } from "@solidjs/router";

type Props = {
  title: string;
  actions?: {
    variant: Variant;
    text: string;
    onAction: () => void;
  }[];
  narrow?: boolean;
  showBack?: boolean;
};

export const Page: ParentComponent<Props> = (props) => {
  const navigate = useNavigate();

  return (
    <div
      class={cn("mx-auto h-full w-full max-w-7xl px-4", {
        "max-w-3xl": props.narrow,
      })}
    >
      <header class="flex items-center justify-between">
        <h1 class="flex items-center gap-2 py-6 font-semibold text-3xl text-gray-800">
          <Show when={props.showBack}>
            <button
              type="button"
              class="rounded-md p-1 transition hover:bg-gray-50"
              onClick={() => navigate(-1)}
            >
              <ChevronLeftIcon size={28} />
            </button>
          </Show>
          {props.title}
        </h1>
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
