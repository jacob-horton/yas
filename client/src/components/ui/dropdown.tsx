import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import {
  type Component,
  createEffect,
  createSignal,
  createUniqueId,
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
  options: { label: string; value: string; disabled?: boolean }[];
  onChange: (value: string) => void;
  error?: string;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = createSignal(-1);

  // Generate unique IDs for ARIA accessibility linking
  const listboxId = createUniqueId();
  const labelId = createUniqueId();
  const buttonId = createUniqueId();

  let dropdownWrapperRef: HTMLDivElement | undefined;
  let triggerButtonRef: HTMLButtonElement | undefined;
  let listboxRef: HTMLDivElement | undefined;

  const selectedOption = () =>
    props.options.find((o) => o.value === props.value);
  const currentLabel = () =>
    selectedOption()?.label ?? props.fallback ?? "Select an option";

  // Focus management when opening/closing
  createEffect(() => {
    if (isOpen()) {
      // Find index of currently selected value to focus it, or default to 0
      const index = props.options.findIndex((o) => o.value === props.value);
      setFocusedOptionIndex(index >= 0 ? index : 0);

      // We must wait for the DOM to render the list before focusing
      requestAnimationFrame(() => {
        const options = listboxRef?.querySelectorAll('[role="option"]');
        if (options?.[index >= 0 ? index : 0]) {
          (options[index >= 0 ? index : 0] as HTMLElement).focus();
        }
      });
    } else {
      // Return focus to button when closed (if it was previously focused)
      if (
        document.activeElement &&
        listboxRef?.contains(document.activeElement)
      ) {
        triggerButtonRef?.focus();
      }
    }
  });

  const closeDropdown = () => {
    setIsOpen(false);
    triggerButtonRef?.focus();
  };

  const handleOptionSelect = (value: string) => {
    props.onChange(value);
    closeDropdown();
  };

  // Helper to find next non-disabled option
  const moveFocus = (direction: 1 | -1) => {
    setFocusedOptionIndex((prev) => {
      let next = prev + direction;
      // Loop through options max 'length' times to prevent infinite loop
      for (let i = 0; i < props.options.length; i++) {
        if (next >= props.options.length) next = 0;
        if (next < 0) next = props.options.length - 1;

        if (!props.options[next].disabled) {
          (listboxRef?.children[next] as HTMLElement)?.focus();
          return next;
        }

        next += direction;
      }

      return prev;
    });
  };

  const handleListKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        // Check if current focused option is disabled before selecting
        if (
          focusedOptionIndex() >= 0 &&
          !props.options[focusedOptionIndex()].disabled
        ) {
          handleOptionSelect(props.options[focusedOptionIndex()].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  // Keyboard handler for the TRIGGER BUTTON
  const handleTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

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
              id={labelId}
              class={cn("text-gray-400 text-xs transition", {
                "text-red-400": !!props.error,
              })}
            >
              {props.label}
            </p>

            <button
              ref={triggerButtonRef}
              id={buttonId}
              type="button"
              class={cn(
                "flex w-full items-center justify-between outline-none transition disabled:text-gray-300",
                { "disabled:text-red-300": !!props.error },
              )}
              disabled={props.options.length === 0}
              onClick={() => setIsOpen(!isOpen())}
              onKeyDown={handleTriggerKeyDown}
              aria-haspopup="listbox"
              aria-expanded={isOpen()}
              aria-controls={listboxId}
              aria-labelledby={`${labelId} ${buttonId}`}
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
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            tabIndex={-1}
            class="absolute top-full left-0 z-10 mt-2 w-full overflow-y-auto rounded-md border bg-white shadow-lg outline-none"
          >
            <For
              each={props.options}
              fallback={
                <div class="px-3 py-2 text-gray-400">
                  {props.fallback ?? "No options available"}
                </div>
              }
            >
              {(option, index) => (
                <div
                  role="option"
                  id={`${listboxId}-option-${index()}`}
                  tabIndex={-1}
                  aria-selected={props.value === option.value}
                  class={cn(
                    "cursor-pointer px-3 py-2 text-black outline-none transition hover:bg-gray-100 focus:bg-gray-100",
                    { "font-semibold": props.value === option.value },
                    { "cursor-not-allowed text-gray-300": option.disabled },
                  )}
                  onClick={() => {
                    if (option.disabled) return;
                    handleOptionSelect(option.value);
                  }}
                  onKeyDown={handleListKeyDown}
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
