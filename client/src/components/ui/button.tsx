import type { ParentComponent } from "solid-js";
import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/classname";
import { ICON_MAP, type Icon } from "@/lib/icons";
import LoaderCircleIcon from "lucide-solid/icons/loader-circle";

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
  loading?: boolean;
}> = (props) => {
  const disabled = () => props.disabled || props.loading;

  return (
    <button
      class={cn(
        "relative flex h-8 w-fit cursor-pointer items-center justify-center whitespace-nowrap rounded-md p-10 py-1 font-semibold",
        COLOUR_MAP[props.variant ?? "primary"],
        {
          "p-1.5": props.icon && !props.children,
          "hover:bg-red-50 hover:text-red-600":
            props.danger && props.variant === "ghost",
          "border-red-700 text-red-700 hover:bg-red-100 dark:hover:bg-red-500/20":
            props.danger && props.variant === "secondary",
          "cursor-not-allowed bg-gray-300 hover:bg-gray-300": disabled(),
          "bg-transparent text-gray-400 hover:bg-transparent dark:text-gray-700 dark:hover:bg-transparent":
            props.variant === "ghost" && disabled(),
          "bg-gray-100 hover:bg-gray-100":
            props.variant === "secondary" && disabled(),
        },
        props.class,
      )}
      onClick={props.onClick}
      type={props.type ?? "button"}
      disabled={disabled()}
    >
      <Show when={props.loading}>
        <div class="absolute inset-0 flex items-center justify-center">
          <LoaderCircleIcon class="animate-spin" />
        </div>
      </Show>

      <div class={cn("flex items-center gap-2", { invisible: props.loading })}>
        <Show when={props.icon}>
          {(icon) => <Dynamic component={ICON_MAP[icon()]} />}
        </Show>
        {props.children}
      </div>
    </button>
  );
};
