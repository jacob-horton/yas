import {
  DatePicker as ArkDatePicker,
  type DateValue,
} from "@ark-ui/solid/date-picker";
import CalendarIcon from "lucide-solid/icons/calendar";
import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import { type Component, Index, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "@/lib/classname";

export const DatePicker: Component<{
  class?: string;
  label: string;
  placeholder?: string;
  value?: DateValue;
  error?: string;
  onChange: (value: DateValue) => void;
}> = (props) => {
  const currentLocale =
    typeof navigator !== "undefined" ? navigator.language : "en-GB";

  return (
    <div
      class={cn(
        "flex h-min flex-col gap-1 transition",
        { "text-red-500": !!props.error },
        props.class,
      )}
    >
      <ArkDatePicker.Root
        value={props.value ? [props.value] : []}
        onValueChange={(details) => props.onChange(details.value[0])}
        locale={currentLocale}
        class="flex flex-col gap-1"
      >
        <ArkDatePicker.Control
          class={cn(
            "group flex h-16 max-w-96 items-center rounded-md border font-semibold transition focus-within:border-violet-500",
            {
              "border-red-300 bg-red-100 focus-within:border-red-500":
                !!props.error,
              "bg-white": !props.error,
            },
          )}
        >
          {/* Accent Side Bar */}
          <div
            class={cn(
              "h-16 w-2 rounded-l-sm transition group-focus-within:bg-violet-500",
              { "group-focus-within:bg-red-500": !!props.error },
            )}
          />
          <div class="flex w-full min-w-0 flex-col px-3 py-2">
            <ArkDatePicker.Label
              class={cn("text-gray-400 text-xs transition", {
                "text-red-400": !!props.error,
              })}
            >
              {props.label}
            </ArkDatePicker.Label>

            <div class="flex w-full items-center gap-2">
              <ArkDatePicker.Input
                class={cn(
                  "w-full bg-transparent outline-none transition placeholder:text-gray-300",
                  { "placeholder:text-red-300": !!props.error },
                )}
                placeholder={props.placeholder}
              />
              <ArkDatePicker.Trigger class="text-gray-400 transition hover:text-gray-500 focus:outline-none">
                <CalendarIcon class="size-4" />
              </ArkDatePicker.Trigger>
            </div>
          </div>
        </ArkDatePicker.Control>

        <Portal>
          <ArkDatePicker.Positioner>
            <ArkDatePicker.Content class="z-50 flex flex-col gap-4 rounded-md border bg-white p-4 shadow-lg">
              {/* --- DAY VIEW --- */}
              <ArkDatePicker.View view="day">
                <ArkDatePicker.Context>
                  {(context) => (
                    <div class="flex flex-col gap-4">
                      <ArkDatePicker.ViewControl class="flex items-center justify-between gap-4">
                        <ArkDatePicker.PrevTrigger class="flex size-8 items-center justify-center rounded-md transition hover:bg-gray-100 focus:outline-none">
                          <ChevronLeftIcon class="size-4" />
                        </ArkDatePicker.PrevTrigger>
                        <ArkDatePicker.ViewTrigger class="rounded-md px-4 py-2 font-semibold text-sm transition hover:bg-gray-100 focus:outline-none">
                          <ArkDatePicker.RangeText />
                        </ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.NextTrigger class="flex size-8 items-center justify-center rounded-md transition hover:bg-gray-100 focus:outline-none">
                          <ChevronRightIcon class="size-4" />
                        </ArkDatePicker.NextTrigger>
                      </ArkDatePicker.ViewControl>

                      <ArkDatePicker.Table class="flex flex-col gap-1">
                        <ArkDatePicker.TableHead>
                          <ArkDatePicker.TableRow class="flex w-full gap-1">
                            <Index each={context().weekDays}>
                              {(weekDay) => (
                                <ArkDatePicker.TableHeader class="flex h-8 w-8 items-center justify-center font-semibold text-gray-400 text-xs">
                                  {weekDay().short}
                                </ArkDatePicker.TableHeader>
                              )}
                            </Index>
                          </ArkDatePicker.TableRow>
                        </ArkDatePicker.TableHead>
                        <ArkDatePicker.TableBody class="flex flex-col gap-1">
                          <Index each={context().weeks}>
                            {(week) => (
                              <ArkDatePicker.TableRow class="flex w-full gap-1">
                                <Index each={week()}>
                                  {(day) => (
                                    <ArkDatePicker.TableCell value={day()}>
                                      <ArkDatePicker.TableCellTrigger class="flex h-8 w-8 items-center justify-center rounded-md text-sm transition hover:bg-gray-100 focus:outline-none data-[today]:border data-[today]:border-violet-500 data-[selected]:bg-violet-500 data-[selected]:font-semibold data-[outside-range]:text-gray-300 data-[selected]:text-white">
                                        {day().day}
                                      </ArkDatePicker.TableCellTrigger>
                                    </ArkDatePicker.TableCell>
                                  )}
                                </Index>
                              </ArkDatePicker.TableRow>
                            )}
                          </Index>
                        </ArkDatePicker.TableBody>
                      </ArkDatePicker.Table>
                    </div>
                  )}
                </ArkDatePicker.Context>
              </ArkDatePicker.View>

              {/* --- MONTH VIEW --- */}
              <ArkDatePicker.View view="month">
                <ArkDatePicker.Context>
                  {(context) => (
                    <div class="flex flex-col gap-4">
                      <ArkDatePicker.ViewControl class="flex items-center justify-between gap-4">
                        <ArkDatePicker.PrevTrigger class="flex size-8 items-center justify-center rounded-md transition hover:bg-gray-100 focus:outline-none">
                          <ChevronLeftIcon class="size-4" />
                        </ArkDatePicker.PrevTrigger>
                        <ArkDatePicker.ViewTrigger class="rounded-md px-4 py-2 font-semibold text-sm transition hover:bg-gray-100 focus:outline-none">
                          <ArkDatePicker.RangeText />
                        </ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.NextTrigger class="flex size-8 items-center justify-center rounded-md transition hover:bg-gray-100 focus:outline-none">
                          <ChevronRightIcon class="size-4" />
                        </ArkDatePicker.NextTrigger>
                      </ArkDatePicker.ViewControl>

                      <ArkDatePicker.Table class="flex flex-col gap-1">
                        <ArkDatePicker.TableBody class="grid grid-cols-4 gap-2">
                          <Index
                            each={context().getMonths({ format: "short" })}
                          >
                            {(month) => (
                              <ArkDatePicker.TableCell value={month().value}>
                                <ArkDatePicker.TableCellTrigger class="flex h-10 items-center justify-center rounded-md text-sm transition hover:bg-gray-100 focus:outline-none data-[selected]:bg-violet-500 data-[selected]:font-semibold data-[selected]:text-white">
                                  {month().label}
                                </ArkDatePicker.TableCellTrigger>
                              </ArkDatePicker.TableCell>
                            )}
                          </Index>
                        </ArkDatePicker.TableBody>
                      </ArkDatePicker.Table>
                    </div>
                  )}
                </ArkDatePicker.Context>
              </ArkDatePicker.View>

              {/* --- YEAR VIEW --- */}
              <ArkDatePicker.View view="year">
                <ArkDatePicker.Context>
                  {(context) => (
                    <div class="flex flex-col gap-4">
                      <ArkDatePicker.ViewControl class="flex items-center justify-between gap-4">
                        <ArkDatePicker.PrevTrigger class="flex size-8 items-center justify-center rounded-md transition hover:bg-gray-100 focus:outline-none">
                          <ChevronLeftIcon class="size-4" />
                        </ArkDatePicker.PrevTrigger>
                        <ArkDatePicker.ViewTrigger class="rounded-md px-4 py-2 font-semibold text-sm transition hover:bg-gray-100 focus:outline-none">
                          <ArkDatePicker.RangeText />
                        </ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.NextTrigger class="flex size-8 items-center justify-center rounded-md transition hover:bg-gray-100 focus:outline-none">
                          <ChevronRightIcon class="size-4" />
                        </ArkDatePicker.NextTrigger>
                      </ArkDatePicker.ViewControl>

                      <ArkDatePicker.Table class="flex flex-col gap-1">
                        <ArkDatePicker.TableBody class="grid grid-cols-4 gap-2">
                          <Index each={context().getYears()}>
                            {(year) => (
                              <ArkDatePicker.TableCell value={year().value}>
                                <ArkDatePicker.TableCellTrigger class="flex h-10 items-center justify-center rounded-md text-sm transition hover:bg-gray-100 focus:outline-none data-[selected]:bg-violet-500 data-[selected]:font-semibold data-[selected]:text-white">
                                  {year().label}
                                </ArkDatePicker.TableCellTrigger>
                              </ArkDatePicker.TableCell>
                            )}
                          </Index>
                        </ArkDatePicker.TableBody>
                      </ArkDatePicker.Table>
                    </div>
                  )}
                </ArkDatePicker.Context>
              </ArkDatePicker.View>
            </ArkDatePicker.Content>
          </ArkDatePicker.Positioner>
        </Portal>
      </ArkDatePicker.Root>

      <Show when={props.error}>
        <span class="flex items-center gap-1 whitespace-nowrap text-sm">
          <CircleAlertIcon class="size-4 min-h-4 min-w-4" />
          <p>{props.error}</p>
        </span>
      </Show>
    </div>
  );
};
