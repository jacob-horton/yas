import { type Component, createMemo } from "solid-js";
import { type ColourKey, TAILWIND_COLOUR_MAP } from "../constants";
import { useDistributions } from "../hooks/use-distributions";
import { gammaDistributionPoints } from "../lib/distribution-data-points";
import { ChartComponent } from "./chart";

type User = {
  id: string;
  name: string;
  colour: ColourKey;
};

type Props = {
  gameId: string;
  users: User[];
};

export const DistributionCart: Component<Props> = (props) => {
  const distributions = useDistributions(() => props.gameId);

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
