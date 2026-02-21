import type { ParentComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/classname";
import { ICON_MAP, type Icon } from "@/lib/icons";

export type Variant = "primary" | "secondary" | "ghost";

export const ButtonSkeleton: ParentComponent<{
  icon?: Icon;
  class?: string;
}> = (props) => {
  return (
    <button
      type="button"
      class={cn(
        "flex h-8 w-fit animate-pulse cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gray-300 p-10 py-1 font-semibold",
        props.class,
      )}
      disabled
    >
      {props.icon && <Dynamic component={ICON_MAP[props.icon]} />}
      {props.children}
    </button>
  );
};
