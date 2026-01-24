import { cn } from "@/lib/classname";
import type { ParentComponent } from "solid-js";

export type Variant = "primary" | "secondary";

const COLOUR_MAP: Record<Variant, string> = {
  primary: "bg-violet-500 text-white",
  secondary: "bg-white border",
} as const;

export const Button: ParentComponent<{
  variant?: Variant;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}> = (props) => {
  return (
    <button
      class={cn(
        "whitespace-nowrap rounded-md p-10 py-1 font-medium hover:cursor-pointer",
        COLOUR_MAP[props.variant ?? "primary"],
      )}
      onClick={props.onClick}
      type={props.type ?? "button"}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
