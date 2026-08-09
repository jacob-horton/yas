import { useNavigate } from "@solidjs/router";
import { For, Match, type ParentProps, Show, Switch } from "solid-js";
import { useOptionalSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/classname";
import type { Icon } from "@/lib/icons";
import { Button, type Variant } from "../ui/button";
import { Menu, type MenuOption } from "../ui/menu";
import { Container } from "./container";

type ActionBase = {
  variant: Variant;
  text: string;
  danger?: boolean;
  icon?: Icon;
  type: "href" | "button" | "menu";
};

type ActionHref = ActionBase & {
  href: string;
  onAction?: never;
  type: "href";
};

type ActionButton = ActionBase & {
  onAction: () => void;
  href?: never;
  type: "button";
};

type ActionMenu = {
  text: string;
  options: MenuOption[];
  value: string;
  type: "menu";
};

export type Action = ActionHref | ActionButton | ActionMenu;

type Props = {
  title: string;
  actions?: Action[];
  showBack?: boolean;
  class?: string;
  narrow?: boolean;
};

export function Page(props: ParentProps<Props>) {
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
                <Switch>
                  <Match when={action.type === "button"}>
                    {(_) => {
                      const buttonAction = action as ActionButton;

                      return (
                        <Button
                          onClick={buttonAction.onAction}
                          variant={buttonAction.variant}
                          danger={buttonAction.danger}
                          icon={buttonAction.icon}
                          iconOnlyOnMobile={!!buttonAction.icon}
                        >
                          {buttonAction.text}
                        </Button>
                      );
                    }}
                  </Match>

                  <Match when={action.type === "href"}>
                    {(_) => {
                      const hrefAction = action as ActionHref;

                      return (
                        <Button
                          href={hrefAction.href}
                          variant={hrefAction.variant}
                          danger={hrefAction.danger}
                          icon={hrefAction.icon}
                          iconOnlyOnMobile={!!hrefAction.icon}
                        >
                          {action.text}
                        </Button>
                      );
                    }}
                  </Match>

                  <Match when={action.type === "menu"}>
                    {(_) => {
                      const menuAction = action as ActionMenu;

                      return (
                        <Menu
                          options={menuAction.options}
                          text={menuAction.text}
                          value={menuAction.value}
                        />
                      );
                    }}
                  </Match>
                </Switch>
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
}
