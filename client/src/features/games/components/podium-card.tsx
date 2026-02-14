import { type Component, Suspense } from "solid-js";
import {
  Avatar,
  type AvatarColour,
  type AvatarIcon,
} from "@/components/ui/avatar";
import { AvatarSkeleton } from "@/components/ui/avatar.skeleton";
import { cn } from "@/lib/classname";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { RANK_BG_GRADIENTS } from "@/lib/rank-colours";

const RANK_SIZES: Record<number, string> = {
  1: "h-80 text-4xl",
  2: "h-72 text-3xl",
  3: "h-68 text-2xl",
};

export const PodiumCard: Component<{
  avatar: AvatarIcon;
  avatarColour: AvatarColour;
  name: string;
  position: number;
  winRate: number;
  pointsPerGame: number;
}> = (props) => {
  return (
    <div
      class={cn(
        "flex w-68 flex-col justify-between overflow-clip rounded-md border pb-8",
        RANK_SIZES[props.position],
      )}
    >
      <div
        class={cn(
          "relative border-b bg-gradient-to-br px-6 py-4 text-end font-semibold text-4xl text-white",
          RANK_BG_GRADIENTS[props.position],
        )}
      >
        {ordinalSuffix(props.position)}
        <div class="-translate-y-1/2 absolute top-full flex size-20 items-center justify-center rounded-full border bg-white p-2">
          <Suspense fallback={<AvatarSkeleton />}>
            <Avatar colour={props.avatarColour} avatar={props.avatar} />
          </Suspense>
        </div>
      </div>

      <div class="flex h-full flex-col justify-between gap-4 px-6 pt-14">
        <p class="font-semibold">{props.name}</p>

        <div class="flex">
          <div class="w-full font-semibold">
            <p class="font-mono-nums text-lg">
              {(props.winRate * 100).toFixed(0)}%
            </p>
            <p class="font-normal text-gray-400 text-xs">WIN RATE</p>
          </div>

          <div class="w-full font-semibold">
            <p class="font-mono-nums text-lg">
              {props.pointsPerGame.toFixed(2)}
            </p>
            <p class="font-normal text-gray-400 text-xs">POINTS/GAME</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO: reduce duplication
export const PodiumCardSkeleton: Component<{ position: number }> = (props) => {
  return (
    <div class="w-68 overflow-clip rounded-md border pb-8">
      <div
        class={cn(
          "relative border-b bg-gradient-to-br px-6 py-4 text-end font-semibold text-4xl text-white",
          RANK_BG_GRADIENTS[props.position],
        )}
      >
        {ordinalSuffix(props.position)}
        <div class="-translate-y-1/2 absolute top-full flex size-20 items-center justify-center rounded-full border bg-white">
          <div class="size-10 rounded-full bg-gray-300" />
        </div>
      </div>

      <div class="flex animate-pulse flex-col gap-5 px-6 pt-14">
        <div class="flex h-9 items-center py-1">
          <span class="h-full w-3/4 rounded-md bg-gray-200" />
        </div>

        <div class="flex">
          <div class="w-full font-semibold">
            <div class="flex h-7 items-center py-1">
              <span class="h-full w-1/2 rounded-md bg-gray-200" />
            </div>
            <p class="font-normal text-gray-400 text-xs">WIN RATE</p>
          </div>

          <div class="w-full font-semibold">
            <div class="flex h-7 items-center py-1">
              <span class="h-full w-1/2 rounded-md bg-gray-200" />
            </div>
            <p class="font-normal text-gray-400 text-xs">POINTS/GAME</p>
          </div>
        </div>
      </div>
    </div>
  );
};
