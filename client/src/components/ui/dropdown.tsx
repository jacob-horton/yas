import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import {
  type Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";
import { cn } from "@/lib/classname";

export const Dropdown: Component<{
  class?: string;
  label: string;
  value: string;
  fallback?: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  error?: string;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  let dropdownWrapperRef: HTMLDivElement | undefined;

  const selectedOption = () =>
    props.options.find((o) => o.value === props.value);
  const currentLabel = () =>
    selectedOption()?.label ?? props.fallback ?? "Select an option";

  createEffect(() => {
    if (props.options.length === 0) {
      return;
    }

    if (!props.options.find((o) => o.value === props.value)) {
      props.onChange(props.options[0].value);
    }
  });

  // Close if clicked outside dropdown button
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownWrapperRef && !dropdownWrapperRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  onCleanup(() => document.removeEventListener("click", handleClickOutside));

  return (
    <div
      class={cn(
        "flex h-16 max-w-96 flex-col gap-1 transition",
        { "text-red-500": !!props.error },
        props.class,
      )}
    >
      <div ref={dropdownWrapperRef} class="relative h-full w-full">
        <div
          class={cn(
            "group flex h-full w-full items-center rounded-md border font-semibold transition",
            {
              "border-violet-500": isOpen() && !props.error,
              "focus-within:border-violet-500": !props.error,
              "border-red-500 bg-red-100 focus-within:border-red-500":
                !!props.error,
            },
          )}
        >
          <div
            class={cn("h-full w-2 rounded-l-sm bg-transparent transition", {
              "bg-violet-500": isOpen() && !props.error,
              "group-focus-within:bg-violet-500": !props.error,
              "bg-red-500": isOpen() && !!props.error,
              "group-focus-within:bg-red-500": !!props.error,
            })}
          />
          <div class="w-full px-3 py-2">
            <p
              class={cn("text-gray-400 text-xs transition", {
                "text-red-400": !!props.error,
              })}
            >
              {props.label}
            </p>
            <button
              type="button"
              class={cn(
                "flex w-full items-center justify-between outline-none transition disabled:text-gray-300",
                { "disabled:text-red-300": !!props.error },
              )}
              disabled={props.options.length === 0}
              onClick={() => setIsOpen(!isOpen())}
              aria-haspopup="listbox"
              aria-expanded={isOpen()}
            >
              <span class="text-left">{currentLabel()}</span>
              <ChevronDownIcon
                size={18}
                class={cn("text-gray-500 transition-transform", {
                  "rotate-180": isOpen(),
                })}
              />
            </button>
          </div>
        </div>

        <Show when={isOpen()}>
          <div
            role="listbox"
            class="absolute top-full left-0 z-10 mt-2 w-full overflow-y-auto rounded-md border bg-white shadow-lg"
          >
            <For
              each={props.options}
              fallback={
                <div class="px-3 py-2 text-gray-400">
                  {props.fallback ?? "No options available"}
                </div>
              }
            >
              {(option) => (
                <div
                  role="option"
                  tabIndex={0}
                  aria-selected={props.value === option.value}
                  class={cn(
                    "cursor-pointer px-3 py-2 text-black transition hover:bg-gray-100",
                    { "font-semibold": props.value === option.value },
                  )}
                  onClick={() => {
                    props.onChange(option.value);
                    setIsOpen(false);
                  }}
                  onKeyDown={() => {
                    props.onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </div>
              )}
            </For>
          </div>
        </Show>
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
