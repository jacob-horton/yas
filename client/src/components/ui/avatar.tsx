import type { Component } from "solid-js";
import BasketballSvg from "@/assets/avatars/basketball.svg";
import CrabSvg from "@/assets/avatars/crab.svg";
import FrogSvg from "@/assets/avatars/frog.svg";
import HeadphonesSvg from "@/assets/avatars/headphones.svg";
import HelmetSvg from "@/assets/avatars/helmet.svg";
import RocketSvg from "@/assets/avatars/rocket.svg";
import { cn } from "@/lib/classname";

export const COLOUR_MAP = {
  red: "text-red-400",
  orange: "text-orange-400",
  amber: "text-amber-400",
  yellow: "text-yellow-400",
  lime: "text-lime-400",
  green: "text-green-400",
  emerald: "text-emerald-400",
  teal: "text-teal-400",
  cyan: "text-cyan-400",
  sky: "text-sky-400",
  blue: "text-blue-400",
  indigo: "text-indigo-400",
  violet: "text-violet-400",
  purple: "text-purple-400",
  fuchsia: "text-fuchsia-400",
  pink: "text-pink-400",
  rose: "text-rose-400",
  slate: "text-slate-400",
};

export const AVATAR_SVGS = {
  crab: CrabSvg,
  basketball: BasketballSvg,
  frog: FrogSvg,
  helmet: HelmetSvg,
  headphones: HeadphonesSvg,
  rocket: RocketSvg,
} as const;

export type AvatarColour = keyof typeof COLOUR_MAP;
export type AvatarIcon = keyof typeof AVATAR_SVGS;

type Props = {
  colour: AvatarColour;
  avatar: AvatarIcon;
  class?: string;
};

export const Avatar: Component<Props> = (props) => {
  const Svg = AVATAR_SVGS[props.avatar];
  return <Svg class={cn(COLOUR_MAP[props.colour], props.class)} />;
};
