import type { ParentComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/classname";
import { ICON_MAP, type Icon } from "@/lib/icons";

export type Variant = "primary" | "secondary" | "ghost";

const COLOUR_MAP: Record<Variant, string> = {
  primary:
    "bg-violet-500 dark:bg-violet-700 text-white hover:bg-violet-600 transition",
  secondary: "border hover:bg-gray-100 dark:hover:bg-gray-100/10 transition",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-100/10 transition",
} as const;

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
          "border-red-700 text-red-700 hover:bg-red-100 dark:hover:bg-red-500/20":
            props.danger && props.variant === "secondary",
          "cursor-not-allowed bg-transparent text-gray-400 hover:bg-transparent dark:text-gray-700 dark:hover:bg-transparent":
            props.variant === "ghost" && props.disabled,
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
