import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import { type Component, createEffect, For } from "solid-js";

export const Dropdown: Component<{
  label: string;
  value: string;
  fallback?: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  error?: string;
}> = (props) => {
  // If option doesn't exist, fallback to the first option
  createEffect(() => {
    if (props.options.length === 0) {
      return;
    }

    if (!props.options.find((o) => o.value === props.value)) {
      props.onChange(props.options[0].value);
    }
  });

  return (
    <div
      class="flex flex-col gap-1 transition"
      classList={{ "text-red-500": !!props.error }}
    >
      <div
        class="group flex max-w-96 rounded-md border font-medium transition focus-within:border-orange-400"
        classList={{ "bg-red-100 focus-within:border-red-500": !!props.error }}
      >
        <div
          class="w-2 bg-transparent transition group-focus-within:bg-orange-400"
          classList={{ "group-focus-within:bg-red-500": !!props.error }}
        />
        <div class="w-full px-3 py-2">
          <p
            class="text-gray-400 text-xs transition"
            classList={{ "text-red-400": !!props.error }}
          >
            {props.label}
          </p>
          <select
            class="w-full outline-none transition disabled:text-gray-300"
            classList={{ "disabled:text-red-300": !!props.error }}
            value={props.options.length > 0 ? props.value : ""}
            onChange={(e) => props.onChange(e.target.value)}
            disabled={props.options.length === 0}
          >
            <For
              each={props.options}
              fallback={
                <option value="" disabled selected>
                  {props.fallback}
                </option>
              }
            >
              {(option) => (
                <option
                  selected={props.value === option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )}
            </For>
          </select>
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
