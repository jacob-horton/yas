import type { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import BasketballSvg from "@/assets/avatars/basketball.svg";
import BearSvg from "@/assets/avatars/bear.svg";
import BombSvg from "@/assets/avatars/bomb.svg";
import CactusSvg from "@/assets/avatars/cactus.svg";
import CatSvg from "@/assets/avatars/cat.svg";
import ControllerSvg from "@/assets/avatars/controller.svg";
import CrabSvg from "@/assets/avatars/crab.svg";
import FlowerSvg from "@/assets/avatars/flower.svg";
import FlowerBudSvg from "@/assets/avatars/flower-bud.svg";
import FrogSvg from "@/assets/avatars/frog.svg";
import GhostSvg from "@/assets/avatars/ghost.svg";
import HelmetSvg from "@/assets/avatars/helmet.svg";
import LightbulbSvg from "@/assets/avatars/lightbulb.svg";
import LilySvg from "@/assets/avatars/lily.svg";
import MagnetSvg from "@/assets/avatars/magnet.svg";
import OctopusSvg from "@/assets/avatars/octopus.svg";
import PenguinSvg from "@/assets/avatars/penguin.svg";
import PenroseTriangleSvg from "@/assets/avatars/penrose-triangle.svg";
import PlanetSvg from "@/assets/avatars/planet.svg";
import PlantSvg from "@/assets/avatars/plant.svg";
import RobotSvg from "@/assets/avatars/robot.svg";
import RocketSvg from "@/assets/avatars/rocket.svg";
import RoseSvg from "@/assets/avatars/rose.svg";
import ShibaInuSvg from "@/assets/avatars/shiba-inu.svg";
import WizardSvg from "@/assets/avatars/wizard.svg";
import { cn } from "@/lib/classname";

export const COLOUR_MAP = {
  red: {
    text: "text-red-400",
    bg: "bg-red-400",
    shadow:
      "color-mix(in oklch, var(--color-red-500), var(--color-indigo-800) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-red-700), var(--color-indigo-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-red-300), white 15%)",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-400",
    shadow:
      "color-mix(in oklch, var(--color-orange-500), var(--color-red-700) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-orange-700), var(--color-red-900) 30%)",
    highlight: "color-mix(in oklch, var(--color-orange-200), white 15%)",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-400",
    shadow:
      "color-mix(in oklch, var(--color-amber-500), var(--color-orange-700) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-amber-700), var(--color-orange-900) 30%)",
    highlight: "color-mix(in oklch, var(--color-amber-100), white 15%)",
  },
  yellow: {
    text: "text-yellow-400",
    bg: "bg-yellow-400",
    shadow:
      "color-mix(in oklch, var(--color-yellow-500), var(--color-orange-600) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-yellow-700), var(--color-orange-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-yellow-100), white 30%)",
  },
  lime: {
    text: "text-lime-400",
    bg: "bg-lime-400",
    shadow:
      "color-mix(in oklch, var(--color-lime-500), var(--color-teal-700) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-lime-700), var(--color-teal-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-lime-200), white 15%)",
  },
  green: {
    text: "text-green-400",
    bg: "bg-green-400",
    shadow:
      "color-mix(in oklch, var(--color-green-500), var(--color-emerald-800) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-green-700), var(--color-emerald-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-green-200), white 15%)",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-400",
    shadow:
      "color-mix(in oklch, var(--color-emerald-500), var(--color-cyan-800) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-emerald-700), var(--color-cyan-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-emerald-200), white 15%)",
  },
  teal: {
    text: "text-teal-400",
    bg: "bg-teal-400",
    shadow:
      "color-mix(in oklch, var(--color-teal-500), var(--color-blue-800) 25%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-teal-700), var(--color-blue-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-teal-200), white 15%)",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-400",
    shadow:
      "color-mix(in oklch, var(--color-cyan-500), var(--color-indigo-700) 25%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-cyan-700), var(--color-indigo-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-cyan-200), white 15%)",
  },
  sky: {
    text: "text-sky-400",
    bg: "bg-sky-400",
    shadow:
      "color-mix(in oklch, var(--color-sky-500), var(--color-indigo-800) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-sky-700), var(--color-indigo-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-sky-200), white 15%)",
  },
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-400",
    shadow:
      "color-mix(in oklch, var(--color-blue-500), var(--color-indigo-800) 30%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-blue-700), var(--color-indigo-900) 50%)",
    highlight: "color-mix(in oklch, var(--color-blue-200), white 15%)",
  },
  indigo: {
    text: "text-indigo-400",
    bg: "bg-indigo-400",
    shadow:
      "color-mix(in oklch, var(--color-indigo-500), var(--color-purple-800) 25%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-indigo-700), var(--color-purple-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-indigo-200), white 15%)",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-400",
    shadow:
      "color-mix(in oklch, var(--color-violet-500), var(--color-indigo-900) 30%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-violet-700), var(--color-indigo-900) 50%)",
    highlight: "color-mix(in oklch, var(--color-violet-200), white 15%)",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-400",
    shadow:
      "color-mix(in oklch, var(--color-purple-500), var(--color-indigo-800) 25%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-purple-700), var(--color-indigo-900) 45%)",
    highlight: "color-mix(in oklch, var(--color-purple-200), white 15%)",
  },
  fuchsia: {
    text: "text-fuchsia-400",
    bg: "bg-fuchsia-400",
    shadow:
      "color-mix(in oklch, var(--color-fuchsia-500), var(--color-indigo-800) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-fuchsia-700), var(--color-indigo-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-fuchsia-200), white 15%)",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-400",
    shadow:
      "color-mix(in oklch, var(--color-pink-500), var(--color-rose-800) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-pink-700), var(--color-rose-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-pink-200), white 15%)",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-400",
    shadow:
      "color-mix(in oklch, var(--color-rose-500), var(--color-indigo-800) 20%)",
    shadowDeep:
      "color-mix(in oklch, var(--color-rose-700), var(--color-indigo-900) 40%)",
    highlight: "color-mix(in oklch, var(--color-rose-200), white 15%)",
  },
  slate: {
    text: "text-slate-400",
    bg: "bg-slate-400",
    shadow: "var(--color-slate-500)",
    shadowDeep: "var(--color-slate-700)",
    highlight: "var(--color-slate-200)",
  },
} as const;

export const AVATAR_SVGS = {
  basketball: BasketballSvg,
  bear: BearSvg,
  bomb: BombSvg,
  cactus: CactusSvg,
  cat: CatSvg,
  controller: ControllerSvg,
  crab: CrabSvg,
  flower: FlowerSvg,
  flower_bud: FlowerBudSvg,
  frog: FrogSvg,
  ghost: GhostSvg,
  helmet: HelmetSvg,
  lightbulb: LightbulbSvg,
  lily: LilySvg,
  magnet: MagnetSvg,
  octopus: OctopusSvg,
  penguin: PenguinSvg,
  penrose_triangle: PenroseTriangleSvg,
  planet: PlanetSvg,
  plant: PlantSvg,
  robot: RobotSvg,
  rocket: RocketSvg,
  rose: RoseSvg,
  shiba_inu: ShibaInuSvg,
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
  const theme = () => COLOUR_MAP[props.colour];

  return (
    <Dynamic
      component={AVATAR_SVGS[props.avatar]}
      class={cn(COLOUR_MAP[props.colour].text, props.class)}
      style={{
        "--avatar-main": "currentColor",
        "--avatar-shadow": theme().shadow,
        "--avatar-shadow-deep": theme().shadowDeep,
        "--avatar-highlight": theme().highlight,
      }}
    />
  );
};
