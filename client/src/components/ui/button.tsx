import { A } from "@solidjs/router";
import LoaderCircleIcon from "lucide-solid/icons/loader-circle";
import type { ParentComponent } from "solid-js";
import { Show, splitProps } from "solid-js";
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

type BaseProps = {
  variant?: Variant;
  icon?: Icon;
  class?: string;
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

type AnchorProps = BaseProps & {
  href: string;
  type?: never;
  onClick?: never;
};

type ButtonElementProps = BaseProps & {
  href?: never;
  type?: "button" | "submit";
  onClick?: () => void;
};

type ButtonProps = AnchorProps | ButtonElementProps;

export const Button: ParentComponent<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "href",
    "children",
    "class",
    "variant",
    "loading",
    "disabled",
    "danger",
    "icon",
  ]);

  const isDisabled = () => {
    console.log("recalculating disabled", local.disabled);
    return local.loading || local.disabled;
  };

  const isA = () => !!local.href;
  const Tag = () => (isA() ? A : "button");

  const commonClasses = () =>
    cn(
      "relative flex h-8 w-fit cursor-pointer items-center justify-center whitespace-nowrap rounded-md px-5 py-1 font-semibold",
      COLOUR_MAP[local.variant ?? "primary"],
      {
        "p-1.5": local.icon && !local.children,
        "hover:bg-red-50 hover:text-red-600":
          local.danger && local.variant === "ghost",
        "border-red-700 text-red-700 hover:bg-red-100 dark:hover:bg-red-500/20":
          local.danger && local.variant === "secondary",

        "cursor-not-allowed bg-gray-300 hover:bg-gray-300": isDisabled(),
        "bg-transparent text-gray-400 hover:bg-transparent dark:text-gray-700 dark:hover:bg-transparent":
          local.variant === "ghost" && isDisabled(),
        "bg-gray-100 hover:bg-gray-100":
          local.variant === "secondary" && isDisabled(),

        "pointer-events-none opacity-50": isA() && isDisabled(),
      },
      local.class,
    );

  return (
    <Dynamic
      component={Tag()}
      href={local.href}
      class={commonClasses()}
      disabled={isA() ? undefined : isDisabled()}
      tabIndex={isA() && isDisabled() ? -1 : undefined}
      {...others}
    >
      <Show when={local.loading}>
        <div class="absolute inset-0 flex items-center justify-center">
          <LoaderCircleIcon class="animate-spin" />
        </div>
      </Show>

      <div class={cn("flex items-center gap-2", { invisible: local.loading })}>
        <Show when={local.icon}>
          {(iconName) => <Dynamic component={ICON_MAP[iconName()]} size={18} />}
        </Show>
        {local.children}
      </div>
    </Dynamic>
  );
};
