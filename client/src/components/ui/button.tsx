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
      class={`w-32 rounded-md py-1 font-medium hover:cursor-pointer ${COLOUR_MAP[props.variant ?? "primary"]}`}
      onClick={props.onClick}
      type={props.type ?? "button"}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
