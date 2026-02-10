import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ClipboardIcon from "lucide-solid/icons/clipboard";
import PlusIcon from "lucide-solid/icons/plus";
import TrashIcon from "lucide-solid/icons/trash-2";
import type { Component, ParentComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/classname";

export type Variant = "primary" | "secondary" | "ghost";
export type Icon = "copy" | "chevronLeft" | "plus" | "delete";

const COLOUR_MAP: Record<Variant, string> = {
  primary: "bg-violet-500 text-white hover:bg-violet-600 transition",
  secondary: "bg-white border hover:bg-gray-100 transition",
  ghost: "hover:bg-gray-100 transition",
} as const;

export const ICON_MAP: Record<Icon, Component> = {
  copy: ClipboardIcon,
  chevronLeft: ChevronLeftIcon,
  plus: PlusIcon,
  delete: TrashIcon,
};

export const Button: ParentComponent<{
  variant?: Variant;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  icon?: Icon;
  class?: string;
  danger?: boolean;
}> = (props) => {
  return (
    <button
      class={cn(
        "flex h-8 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md p-10 py-1 font-semibold",
        COLOUR_MAP[props.variant ?? "primary"],
        {
          "p-1.5": props.icon && !props.children,
          "cursor-not-allowed bg-gray-300": props.disabled,
          "hover:bg-red-50 hover:text-red-600":
            props.danger && props.variant === "ghost",
          "border-red-700 text-red-700 hover:bg-red-100":
            props.danger && props.variant === "secondary",
        },
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
