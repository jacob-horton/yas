import type { ParentComponent } from "solid-js";

export type Variant = "primary" | "secondary";

const COLOUR_MAP: Record<Variant, string> = {
  primary: "bg-orange-400 text-white",
  secondary: "bg-white border",
} as const;

export const Button: ParentComponent<{
  variant?: Variant;
  type?: "button" | "submit";
  onClick?: () => void;
}> = (props) => {
  return (
    <button
      class={`w-32 rounded-md py-1 font-medium hover:cursor-pointer ${COLOUR_MAP[props.variant ?? "primary"]}`}
      onClick={props.onClick}
      type={props.type ?? "button"}
    >
      {props.children}
    </button>
  );
};
