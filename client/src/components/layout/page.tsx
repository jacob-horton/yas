import { useNavigate } from "@solidjs/router";
import { For, type ParentComponent, Show } from "solid-js";
import { useOptionalSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/classname";
import type { Icon } from "@/lib/icons";
import { Button, type Variant } from "../ui/button";
import { Container } from "./container";

type ActionBase = {
  variant: Variant;
  text: string;
  danger?: boolean;
  icon?: Icon;
};

type ActionHref = ActionBase & {
  href: string;
  onAction?: never;
};

type ActionButton = ActionBase & {
  onAction: () => void;
  href?: never;
};

export type Action = ActionHref | ActionButton;

type Props = {
  title: string;
  actions?: Action[];
  showBack?: boolean;
  class?: string;
  narrow?: boolean;
};

export const Page: ParentComponent<Props> = (props) => {
  const navigate = useNavigate();
  const sidebar = useOptionalSidebar();

  return (
    <div class="flex h-full w-full flex-col gap-10 overflow-y-auto py-10">
      <Container narrow={props.narrow}>
        <header class="flex items-center justify-between gap-4 overflow-x-auto overflow-y-clip whitespace-nowrap">
          <h1 class="flex items-center gap-2 font-semibold text-2xl leading-normal sm:text-3xl">
            <Show when={sidebar && !props.showBack && !sidebar.isDesktop()}>
              <Button
                ariaLabel="Open sidebar"
                variant="ghost"
                onClick={() => sidebar?.setIsOpen(true)}
                icon="menu"
              />
            </Show>
            <Show when={props.showBack}>
              <Button
                ariaLabel="Navigate back a page"
                variant="ghost"
                onClick={() => navigate(-1)}
                icon="chevronLeft"
              />
            </Show>
            {props.title}
          </h1>
          <div class="flex gap-2 sm:gap-4">
            <For each={props.actions ?? []}>
              {(action) => (
                <Show
                  when={"href" in action}
                  fallback={
                    <Button
                      onClick={action.onAction}
                      variant={action.variant}
                      danger={action.danger}
                      icon={action.icon}
                      iconOnlyOnMobile={!!action.icon}
                    >
                      {action.text}
                    </Button>
                  }
                >
                  <Button
                    href={(action as ActionHref).href}
                    variant={action.variant}
                    danger={action.danger}
                    icon={action.icon}
                    iconOnlyOnMobile={!!action.icon}
                  >
                    {action.text}
                  </Button>
                </Show>
              )}
            </For>
          </div>
        </header>
      </Container>

      <div class={cn("flex flex-1 flex-col", props.class)}>
        {props.children}
      </div>
    </div>
  );
};
