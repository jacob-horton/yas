import type { Component } from 'solid-js';

const COLOUR_MAP: Record<number, string> = {
  1: 'from-amber-200 to-orange-400',
  2: 'from-gray-300 to-gray-400',
  3: 'from-orange-300 to-red-400',
} as const;

const POSITION_MAP: Record<number, string> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
} as const;

export const PodiumCard: Component<{
  name: string;
  position: number;
  winRate: number;
  pointsPerGame: number;
}> = (props) => {
  return (
    <div class="w-60 overflow-clip rounded-md border pb-8">
      <div
        class={`relative border-b border-black bg-gradient-to-br px-6 py-4 text-end text-4xl font-semibold text-white ${COLOUR_MAP[props.position]}`}
      >
        {POSITION_MAP[props.position]}
        <div class="absolute top-full flex size-20 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white">
          <div class="size-10 rounded-full bg-gray-300" />
        </div>
      </div>

      <div class="flex flex-col gap-5 px-6 pt-14">
        <p class="text-3xl font-semibold">{props.name}</p>

        <div class="flex">
          <div class="w-full font-semibold">
            <p class="text-lg">{props.winRate}%</p>
            <p class="text-xs font-normal text-gray-400">WIN RATE</p>
          </div>

          <div class="w-full font-semibold">
            <p class="text-lg">{props.pointsPerGame.toFixed(2)}</p>
            <p class="text-xs font-normal text-gray-400">POINTS/GAME</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO: reduce duplication
export const PodiumCardSkeleton: Component<{ position: number }> = (props) => {
  return (
    <div class="w-60 overflow-clip rounded-md border pb-8">
      <div
        class={`relative border-b border-black bg-gradient-to-br px-6 py-4 text-end text-4xl font-semibold text-white ${COLOUR_MAP[props.position]}`}
      >
        {POSITION_MAP[props.position]}
        <div class="absolute top-full flex size-20 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white">
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
            <p class="text-xs font-normal text-gray-400">WIN RATE</p>
          </div>

          <div class="w-full font-semibold">
            <div class="flex h-7 items-center py-1">
              <span class="h-full w-1/2 rounded-md bg-gray-200" />
            </div>
            <p class="text-xs font-normal text-gray-400">POINTS/GAME</p>
          </div>
        </div>
      </div>
    </div>
  );
};

