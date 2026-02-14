import { useNavigate } from "@solidjs/router";
import { For, type ParentComponent, Show } from "solid-js";
import { Button, type Variant } from "../ui/button";
import { Container } from "./container";

export type Action = {
  variant: Variant;
  text: string;
  onAction: () => void;
  danger?: boolean;
};

type Props = {
  title: string;
  actions?: Action[];
  showBack?: boolean;
  class?: string;
};

export const Page: ParentComponent<Props> = (props) => {
  const navigate = useNavigate();

  return (
    <div class="h-screen w-full bg-white dark:bg-gray-900">
      <Container class="py-10">
        <header class="flex items-center justify-between">
          <h1 class="flex items-center gap-2 font-semibold text-3xl">
            <Show when={props.showBack}>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                icon="chevronLeft"
              />
            </Show>
            {props.title}
          </h1>
          <div class="flex gap-4">
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
          </div>
        </header>
      </Container>
      <div class={props.class}>{props.children}</div>
    </div>
  );
};
