import { useNavigate } from "@solidjs/router";
import { For, type ParentComponent, Show } from "solid-js";
import { Button, type Variant } from "../ui/button";
import { Container } from "./container";

type Props = {
  title: string;
  actions?: {
    variant: Variant;
    text: string;
    onAction: () => void;
    danger?: boolean;
  }[];
  showBack?: boolean;
  class?: string;
};

export const Page: ParentComponent<Props> = (props) => {
  const navigate = useNavigate();

  return (
    <div class="h-full w-full">
      <Container class="py-10">
        <header class="flex items-center justify-between">
          <h1 class="flex items-center gap-2 font-semibold text-3xl text-gray-800">
            <Show when={props.showBack}>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                icon="chevronLeft"
              />
            </Show>
            {props.title}
          </h1>
          <For each={props.actions ?? []}>
            {(action) => (
              <Button
                onClick={action.onAction}
                variant={action.variant}
                danger={action.danger}
              >
                {action.text}
              </Button>
            )}
          </For>
        </header>
      </Container>
      <div class={props.class}>{props.children}</div>
    </div>
  );
};
