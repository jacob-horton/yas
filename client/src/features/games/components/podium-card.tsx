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

type PodiumStats = {
  avatar: AvatarIcon;
  avatarColour: AvatarColour;
  name: string;
  winRate: number;
  pointsPerGame: number;
};

export const PodiumCard: Component<{
  position: number;
  stats?: PodiumStats;
}> = (props) => {
  return (
    <div
      class={cn(
        "flex w-68 flex-col justify-between overflow-clip rounded-md border bg-white pb-8 dark:bg-gray-800",
        RANK_PODIUM_SIZES[props.position],
      )}
    >
      <div
        class={cn(
          "relative border-b bg-gradient-to-br px-6 py-4 text-end font-semibold text-4xl text-white",
          RANK_BG_GRADIENTS[props.position],
        )}
      >
        {ordinalSuffix(props.position)}
        <div class="-translate-y-1/2 absolute top-full flex size-20 items-center justify-center rounded-full border bg-white p-2 dark:bg-gray-800">
          <Show
            when={props.stats}
            fallback={<AvatarSkeleton class="size-10" />}
          >
            {(stats) => (
              <Avatar colour={stats().avatarColour} avatar={stats().avatar} />
            )}
          </Show>
        </div>
      </div>

      <div class="flex h-full flex-col justify-between gap-4 px-6 pt-14">
        <Show when={props.stats} fallback={<TextSkeleton class="w-2/3" />}>
          {(stats) => <p class="font-semibold">{stats().name}</p>}
        </Show>

        <div class="flex">
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
            <p class="font-normal text-gray-400 text-xs dark:text-gray-500">
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
            <p class="font-normal text-gray-400 text-xs dark:text-gray-500">
              POINTS/GAME
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
