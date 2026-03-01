import { type Component, Show } from "solid-js";
import {
  Avatar,
  type AvatarColour,
  type AvatarIcon,
} from "@/components/ui/avatar";
import { AvatarSkeleton } from "@/components/ui/avatar.skeleton";
import { TextSkeleton } from "@/components/ui/text.skeleton";
import { cn } from "@/lib/classname";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { RANK_BG_GRADIENTS } from "@/lib/rank-colours";
import { RANK_PODIUM_SIZES } from "../constants";

const getResponsiveOrder = (position: number, total: number) => {
  if (total === 2) {
    return {
      1: "order-1 md:order-1",
      2: "order-2 md:order-2",
    }[position];
  }

  return {
    1: "order-1 md:order-2",
    2: "order-2 md:order-1",
    3: "order-3 md:order-3",
  }[position];
};

type PodiumStats = {
  avatar: AvatarIcon;
  avatarColour: AvatarColour;
  name: string;
  winRate: number;
  pointsPerGame: number;
};

export const PodiumCard: Component<{
  position: number;
  total: number;
  stats?: PodiumStats;
}> = (props) => {
  return (
    <div
      class={cn(
        "flex h-32 w-full flex-row overflow-clip rounded-md border bg-white md:w-76 md:flex-col md:pb-8 dark:bg-gray-800",
        RANK_PODIUM_SIZES[props.position],
        getResponsiveOrder(props.position, props.total),
      )}
    >
      <div
        class={cn(
          "relative flex w-26 shrink-0 items-center border-r bg-gradient-to-br px-5 py-4 font-semibold text-white md:block md:w-auto md:border-r-0 md:border-b md:px-4 md:px-6 md:text-end",
          RANK_BG_GRADIENTS[props.position],
        )}
      >
        {ordinalSuffix(props.position)}

        <div class="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-full flex size-16 items-center justify-center rounded-full border bg-white p-2 sm:size-20 md:top-full md:left-6 md:translate-x-0 dark:bg-gray-800">
          <Show when={props.stats} fallback={<AvatarSkeleton />}>
            {(stats) => (
              <Avatar
                class="size-10 sm:size-14"
                colour={stats().avatarColour}
                avatar={stats().avatar}
              />
            )}
          </Show>
        </div>
      </div>

      <div class="flex flex-1 flex-col justify-center gap-2 py-4 pr-4 pl-12 md:justify-between md:gap-4 md:px-6 md:py-0 md:pt-14">
        <Show when={props.stats} fallback={<TextSkeleton class="w-2/3" />}>
          {(stats) => <p class="font-semibold">{stats().name}</p>}
        </Show>

        <div class="flex gap-2">
          <div class="w-full font-semibold">
            <Show
              when={props.stats}
              fallback={<TextSkeleton class="w-2/3 pb-2" />}
            >
              {(stats) => (
                <p class="font-mono-nums text-lg">
                  {(stats().winRate * 100).toFixed(0)}%
                </p>
              )}
            </Show>
            <p class="font-normal text-2xs text-gray-400 sm:text-xs dark:text-gray-500">
              WIN RATE
            </p>
          </div>

          <div class="w-full font-semibold">
            <Show
              when={props.stats}
              fallback={<TextSkeleton class="w-2/3 pb-2" />}
            >
              {(stats) => (
                <p class="font-mono-nums text-lg">
                  {stats().pointsPerGame.toFixed(2)}
                </p>
              )}
            </Show>
            <p class="font-normal text-2xs text-gray-400 sm:text-xs dark:text-gray-500">
              POINTS/GAME
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
