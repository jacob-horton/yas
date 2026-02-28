import { TagsInput } from "@ark-ui/solid";
import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import InfoIcon from "lucide-solid/icons/info";
import XIcon from "lucide-solid/icons/x";
import { type Component, For, Show } from "solid-js";
import { cn } from "@/lib/classname";
import { Tooltip } from "./tooltip";

export const TagInput: Component<{
  class?: string;
  label: string;
  placeholder?: string;
  value: string[];
  error?: string;
  validate?: (value: string) => boolean;
  onChange: (value: string[]) => void;
  tooltip?: string;
}> = (props) => {
  const isItemInvalid = (val: string) => {
    if (!props.validate) return false;
    return !props.validate(val);
  };

  return (
    <TagsInput.Root
      value={props.value}
      onValueChange={(details) => props.onChange(details.value)}
      addOnPaste
      delimiter={/[ ,;]+/}
      class={cn(
        "flex h-min flex-col gap-1 transition",
        { "text-red-500": !!props.error },
        props.class,
      )}
    >
      <div
        class={cn(
          "group flex min-h-16 max-w-96 items-stretch rounded-md border font-semibold transition focus-within:border-violet-500",
          {
            "border-red-300 bg-red-100 focus-within:border-red-500":
              !!props.error,
          },
        )}
      >
        <div
          class={cn(
            "w-2 rounded-l-sm transition group-focus-within:bg-violet-500",
            { "group-focus-within:bg-red-500": !!props.error },
          )}
        />

        <div class="w-full min-w-0 px-3 py-2">
          <TagsInput.Label
            class={cn("inline-flex gap-1.5 text-gray-400 text-xs transition", {
              "text-red-400": !!props.error,
            })}
          >
            <p>{props.label}</p>
            <Show when={props.tooltip}>
              {(tooltip) => (
                <Tooltip tooltip={tooltip()}>
                  <InfoIcon size={14} />
                </Tooltip>
              )}
            </Show>
          </TagsInput.Label>

          <TagsInput.Control class="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
            <TagsInput.Context>
              {(api) => (
                <For each={api().value}>
                  {(item, index) => {
                    const isInvalid = isItemInvalid(item);

                    return (
                      <TagsInput.Item
                        index={index()}
                        value={item}
                        data-invalid={isInvalid ? "" : undefined}
                        class={cn(
                          "flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 font-medium text-sm transition",
                          "data-[invalid]:bg-red-200 data-[invalid]:text-red-900",
                          { "bg-white/50": !!props.error },
                        )}
                      >
                        <TagsInput.ItemPreview class="flex items-center gap-1">
                          <TagsInput.ItemText class="max-w-32 truncate">
                            {item}
                          </TagsInput.ItemText>

                          <TagsInput.ItemDeleteTrigger class="rounded-full p-0.5 transition-colors hover:bg-black/10">
                            <XIcon class="pointer-events-none size-3" />
                          </TagsInput.ItemDeleteTrigger>
                        </TagsInput.ItemPreview>

                        <TagsInput.ItemInput class="bg-transparent text-sm outline-none" />
                      </TagsInput.Item>
                    );
                  }}
                </For>
              )}
            </TagsInput.Context>

            <TagsInput.Input
              class={cn(
                "min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-gray-300",
                { "placeholder:text-red-300": !!props.error },
              )}
              placeholder={props.value.length === 0 ? props.placeholder : ""}
            />
          </TagsInput.Control>
        </div>
      </div>

      <Show when={props.error}>
        <span class="flex items-center gap-1 whitespace-nowrap text-sm">
          <CircleAlertIcon class="size-4 min-h-4 min-w-4" />
          <p>{props.error}</p>
        </span>
      </Show>
    </TagsInput.Root>
  );
};
