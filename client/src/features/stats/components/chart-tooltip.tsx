import type { ParentComponent } from "solid-js";
import { TOOLTIP_CONTENT_CLASSES } from "@/components/ui/tooltip";
import { cn } from "@/lib/classname";

type Props = {
  anchorPos: { left: string; top: string };
};

export const ChartTooltip: ParentComponent<Props> = (props) => {
  return (
    <div
      class="-translate-x-1/2 -translate-y-[calc(100%+22px)] pointer-events-none absolute z-50 drop-shadow-lg transition-all duration-75 ease-out"
      style={props.anchorPos}
    >
      <div class={cn("relative", TOOLTIP_CONTENT_CLASSES)}>
        {/* Arrow tip */}
        <div class="-bottom-[7px] -translate-x-1/2 absolute left-1/2 h-3 w-3 rotate-45 border-r border-b bg-white" />

        {props.children}
      </div>
    </div>
  );
};
