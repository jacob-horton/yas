import type { ParentComponent } from "solid-js";
import { cn } from "@/lib/classname";

type Props = {
  class?: string;
  narrow?: boolean;
};

export const Container: ParentComponent<Props> = (props) => {
  return (
    <div
      class={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        { "max-w-3xl": props.narrow },
        props.class,
      )}
    >
      {props.children}
    </div>
  );
};
