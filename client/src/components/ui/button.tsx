import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ClipboardIcon from "lucide-solid/icons/clipboard";
import PlusIcon from "lucide-solid/icons/plus";
import type { Component, ParentComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/classname";

export type Variant = "primary" | "secondary" | "ghost";
export type Icon = "copy" | "chevronLeft" | "plus";

const COLOUR_MAP: Record<Variant, string> = {
  primary: "bg-violet-500 text-white",
  secondary: "bg-white border",
  ghost: "hover:bg-gray-100 transition",
} as const;

const ICON_MAP: Record<Icon, Component> = {
  copy: ClipboardIcon,
  chevronLeft: ChevronLeftIcon,
  plus: PlusIcon,
};

export const Button: ParentComponent<{
  variant?: Variant;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  icon?: Icon;
  class?: string;
}> = (props) => {
  return (
    <button
      class={cn(
        "flex w-fit items-center justify-center gap-2 whitespace-nowrap rounded-md p-10 py-1 font-medium hover:cursor-pointer",
        COLOUR_MAP[props.variant ?? "primary"],
        { "p-1.5": props.icon && !props.children },
        props.class,
      )}
      onClick={props.onClick}
      type={props.type ?? "button"}
      disabled={props.disabled}
    >
      {props.icon && <Dynamic component={ICON_MAP[props.icon]} />}
      {props.children}
    </button>
  );
};
