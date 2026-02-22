import { Toast as ArkToast, type ToastOptions } from "@ark-ui/solid/toast";
import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import CircleCheckIcon from "lucide-solid/icons/circle-check";
import InfoIcon from "lucide-solid/icons/info";
import XIcon from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/classname";

export const ICON_MAP = {
  error: CircleAlertIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
} as const;

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
          "border-red-500 bg-red-50 text-red-500": props.toast.type === "error",
          "border-emerald-500 bg-emerald-50 text-emerald-500":
            props.toast.type === "success",
          "border-blue-500 bg-blue-50 text-blue-500":
            props.toast.type === "info",
        },
      )}
    >
      <div
        class={cn("absolute top-0 bottom-0 left-0 w-2 rounded-l-sm", {
          "bg-red-500": props.toast.type === "error",
          "bg-emerald-500": props.toast.type === "success",
          "bg-blue-500": props.toast.type === "info",
        })}
      />
      <Dynamic
        component={
          ICON_MAP[(props.toast.type ?? "info") as keyof typeof ICON_MAP]
        }
        class="size-5"
      />
      <ArkToast.Title class="font-semibold">{props.toast.title}</ArkToast.Title>

      <ArkToast.Description class="col-start-2 text-sm">
        {props.toast.description}
      </ArkToast.Description>

      <ArkToast.CloseTrigger
        class={cn("absolute top-2 right-2 rounded-md p-1 transition", {
          "hover:bg-red-100": props.toast.type === "error",
          "hover:bg-green-100": props.toast.type === "success",
          "hover:bg-blue-100": props.toast.type === "info",
        })}
      >
        <XIcon class="size-4" />
      </ArkToast.CloseTrigger>
    </ArkToast.Root>
  );
};
