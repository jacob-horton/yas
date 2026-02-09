import type { Component } from "solid-js";
import BasketballSvg from "@/assets/avatars/basketball.svg";
import BearSvg from "@/assets/avatars/bear.svg";
import BombSvg from "@/assets/avatars/bomb.svg";
import CatSvg from "@/assets/avatars/cat.svg";
import ControllerSvg from "@/assets/avatars/controller.svg";
import CrabSvg from "@/assets/avatars/crab.svg";
import FrogSvg from "@/assets/avatars/frog.svg";
import GhostSvg from "@/assets/avatars/ghost.svg";
import HeadphonesSvg from "@/assets/avatars/headphones.svg";
import HelmetSvg from "@/assets/avatars/helmet.svg";
import LightbulbSvg from "@/assets/avatars/lightbulb.svg";
import OctopusSvg from "@/assets/avatars/octopus.svg";
import PenguinSvg from "@/assets/avatars/penguin.svg";
import PizzaSvg from "@/assets/avatars/pizza.svg";
import PlanetSvg from "@/assets/avatars/planet.svg";
import RobotSvg from "@/assets/avatars/robot.svg";
import RocketSvg from "@/assets/avatars/rocket.svg";
import WizardSvg from "@/assets/avatars/wizard.svg";
import { cn } from "@/lib/classname";

export const COLOUR_MAP = {
  red: { text: "text-red-400", bg: "bg-red-400" },
  orange: { text: "text-orange-400", bg: "bg-orange-400" },
  amber: { text: "text-amber-400", bg: "bg-amber-400" },
  yellow: { text: "text-yellow-400", bg: "bg-yellow-400" },
  lime: { text: "text-lime-400", bg: "bg-lime-400" },
  green: { text: "text-green-400", bg: "bg-green-400" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-400" },
  teal: { text: "text-teal-400", bg: "bg-teal-400" },
  cyan: { text: "text-cyan-400", bg: "bg-cyan-400" },
  sky: { text: "text-sky-400", bg: "bg-sky-400" },
  blue: { text: "text-blue-400", bg: "bg-blue-400" },
  indigo: { text: "text-indigo-400", bg: "bg-indigo-400" },
  violet: { text: "text-violet-400", bg: "bg-violet-400" },
  purple: { text: "text-purple-400", bg: "bg-purple-400" },
  fuchsia: { text: "text-fuchsia-400", bg: "bg-fuchsia-400" },
  pink: { text: "text-pink-400", bg: "bg-pink-400" },
  rose: { text: "text-rose-400", bg: "bg-rose-400" },
  slate: { text: "text-slate-400", bg: "bg-slate-400" },
};

export const AVATAR_SVGS = {
  basketball: BasketballSvg,
  bear: BearSvg,
  bomb: BombSvg,
  controller: ControllerSvg,
  cat: CatSvg,
  crab: CrabSvg,
  frog: FrogSvg,
  ghost: GhostSvg,
  headphones: HeadphonesSvg,
  helmet: HelmetSvg,
  lightbulb: LightbulbSvg,
  octopus: OctopusSvg,
  penguin: PenguinSvg,
  pizza: PizzaSvg,
  planet: PlanetSvg,
  robot: RobotSvg,
  rocket: RocketSvg,
  wizard: WizardSvg,
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
  return <Svg class={cn(COLOUR_MAP[props.colour].text, props.class)} />;
};
