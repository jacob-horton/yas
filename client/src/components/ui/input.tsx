import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import type { Component } from "solid-js";
import { cn } from "@/lib/classname";

export const Input: Component<{
  class?: string;
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}> = (props) => {
  return (
    <div
      class={cn("flex flex-col gap-1 transition", props.class)}
      classList={{ "text-red-500": !!props.error }}
    >
      <div
        class="group flex max-w-96 rounded-md border font-medium transition focus-within:border-violet-500"
        classList={{ "bg-red-100 focus-within:border-red-500": !!props.error }}
      >
        <div
          class="w-2 rounded-l-sm bg-transparent transition group-focus-within:bg-violet-500"
          classList={{ "group-focus-within:bg-red-500": !!props.error }}
        />
        <div class="w-full min-w-0 px-3 py-2">
          <p
            class="text-gray-400 text-xs transition"
            classList={{ "text-red-400": !!props.error }}
          >
            {props.label}
          </p>
          <input
            class="w-full outline-none transition placeholder:text-gray-300"
            classList={{ "placeholder:text-red-300": !!props.error }}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            type={props.type}
          />
        </div>
      </div>
      {props.error && (
        <span class="flex items-center gap-1 text-sm">
          <CircleAlertIcon size={18} />
          <p>{props.error}</p>
        </span>
      )}
    </div>
  );
};
