import { type Component, createMemo } from "solid-js";
import { useDistributions } from "../hooks/use-distributions";
import { gammaDistributionPoints } from "../lib/distribution-data-points";
import { ChartComponent } from "./chart";

function getTailwindColour(name: string, shade = "400"): string {
  const variableName = `--color-${name}-${shade}`;
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue(variableName)?.trim();
}

export const TAILWIND_COLOUR_MAP: Record<string, string> = {
  red: getTailwindColour("red", "400"),
  orange: getTailwindColour("orange", "400"),
  amber: getTailwindColour("amber", "400"),
  yellow: getTailwindColour("yellow", "400"),
  lime: getTailwindColour("lime", "400"),
  green: getTailwindColour("green", "400"),
  emerald: getTailwindColour("emerald", "400"),
  teal: getTailwindColour("teal", "400"),
  cyan: getTailwindColour("cyan", "400"),
  sky: getTailwindColour("sky", "400"),
  blue: getTailwindColour("blue", "400"),
  indigo: getTailwindColour("indigo", "400"),
  violet: getTailwindColour("violet", "400"),
  purple: getTailwindColour("purple", "400"),
  fuchsia: getTailwindColour("fuchsia", "400"),
  pink: getTailwindColour("pink", "400"),
  rose: getTailwindColour("rose", "400"),
  slate: getTailwindColour("slate", "400"),
};

export type ColorKey = keyof typeof TAILWIND_COLOUR_MAP;

type User = {
  id: string;
  name: string;
  colour: string;
};

type Props = {
  gameId: string;
  users: User[];
};

export const DistributionCart: Component<Props> = (props) => {
  const distributions = useDistributions(() => props.gameId);

  // 1. Create a lookup map internally (Efficient & Clean)
  const userMap = createMemo(() => {
    const map = new Map<string, User>();
    props.users.forEach((u) => {
      map.set(u.id, u);
    });
    return map;
  });

  const distributionPoints = createMemo(() =>
    Object.entries(distributions.data ?? {}).map(
      ([playerId, dist]) =>
        [
          playerId,
          gammaDistributionPoints(
            dist.distribution.alpha ?? 0,
            dist.distribution.lambda ?? 0,
            0,
            90,
          ),
        ] as const,
    ),
  );

  return (
    <ChartComponent
      formatTooltipTitle={() => ""}
      formatTooltipLabel={(item) => item.dataset.label || ""}
      interactionMode="nearest"
      interactionIntersect={false}
      datasets={distributionPoints().map(([id, data]) => {
        return {
          data,
          colour: TAILWIND_COLOUR_MAP[userMap().get(id)?.colour ?? "red"],
          label: userMap().get(id)?.name ?? "",
        };
      })}
    />
  );
};
