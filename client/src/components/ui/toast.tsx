import { Toast as ArkToast, type ToastOptions } from "@ark-ui/solid/toast";
import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import XIcon from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { cn } from "@/lib/classname";

type Props = {
  toast: ToastOptions;
};

export const Toast: Component<Props> = (props) => {
  return (
    <ArkToast.Root
      style={{
        translate: "var(--x) var(--y)",
        scale: "var(--scale)",
        "z-index": "var(--z-index)",
        opacity: "var(--opacity)",
        height: "var(--height)",
        "transition-property": "translate, scale, opacity, height",
        "transition-duration": "400ms",
      }}
      class={cn(
        "grid min-w-64 grid-cols-[auto_1fr] items-center gap-x-2 rounded-md border px-6 py-4 shadow-lg",
        {
          "border-red-600 bg-red-50 text-red-600": props.toast.type === "error",
        },
      )}
    >
      <div
        class={cn("absolute top-0 bottom-0 left-0 w-2 rounded-l-sm", {
          "bg-red-600": props.toast.type === "error",
        })}
      />
      <CircleAlertIcon class="size-5" />
      <ArkToast.Title class="font-semibold">{props.toast.title}</ArkToast.Title>

      <ArkToast.Description class="col-start-2 text-sm">
        {props.toast.description}
      </ArkToast.Description>

      <ArkToast.CloseTrigger
        class={cn("absolute top-2 right-2 rounded-md p-1 transition", {
          "hover:bg-red-100": props.toast.type === "error",
        })}
      >
        <XIcon class="size-4" />
      </ArkToast.CloseTrigger>
    </ArkToast.Root>
  );
};
