import { A } from "@solidjs/router";
import type { LucideProps } from "lucide-solid";
import { type Component, type JSX, Show } from "solid-js";

type Route = {
  href: string;
  name: string;
  icon?: (props: LucideProps) => JSX.Element;
  end?: boolean; // Whether path has to be exact
};

export const NavItem: Component<Route> = (props) => {
  return (
    <A
      href={props.href}
      end={props.end}
      class="flex h-8 items-center gap-2 rounded-md px-2 transition hover:bg-gray-50 dark:hover:bg-gray-800"
      activeClass="bg-violet-50 text-violet-800 hover:bg-violet-100 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30"
    >
      <Show when={props.icon}>{props.icon?.({ size: 18 })}</Show>
      {props.name}
    </A>
  );
};
