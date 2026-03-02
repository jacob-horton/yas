import { Tooltip as ArkTooltip } from "@ark-ui/solid/tooltip";
import type { ParentComponent } from "solid-js";
import { createSignal, onMount } from "solid-js";
import { Portal } from "solid-js/web";

type Props = {
  tooltip: string;
};

export const Tooltip: ParentComponent<Props> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [isTouch, setIsTouch] = createSignal(false);

  onMount(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
    }
  });

  return (
    <ArkTooltip.Root
      open={isTouch() ? open() : undefined}
      onOpenChange={(e) => setOpen(e.open)}
      openDelay={0}
      closeDelay={100}
      positioning={{
        placement: "top",
        offset: { mainAxis: 10 },
      }}
    >
      <ArkTooltip.Trigger
        type="button"
        class="cursor-default outline-none"
        onClick={(e) => {
          if (isTouch()) {
            e.stopPropagation();
            setOpen((o) => !o);
          }
        }}
      >
        {props.children}
      </ArkTooltip.Trigger>

      <Portal>
        <ArkTooltip.Positioner>
          <ArkTooltip.Content
            class="z-50 max-w-xs drop-shadow-lg data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in"
            style={{
              "--arrow-size": "14px",
              "--arrow-background": "white",
              "transform-origin": "var(--transform-origin)",
            }}
          >
            <ArkTooltip.Arrow>
              <ArkTooltip.ArrowTip class="border-t border-l bg-white" />
            </ArkTooltip.Arrow>

            <div class="rounded-md border bg-white px-3 py-2 text-center font-semibold text-xs">
              <span class="font-normal">{props.tooltip}</span>
            </div>
          </ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.Root>
  );
};
