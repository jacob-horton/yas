import { type Component, createMemo } from "solid-js";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { ChartComponent } from "./chart";

const LINE_COLOUR = "oklch(54.1% 0.281 293.009)";

type Props = {
  data: {
    rank: number;
    score: number;
  }[];
};

export const PlayerHistoryChart: Component<Props> = (props) => {
  const data = createMemo(() =>
    props.data.map((d, i) => ({
      x: i,
      y: d.score,
      rank: d.rank,
    })),
  );

  return (
    <ChartComponent
      datasets={[{ data: data(), colour: LINE_COLOUR }]}
      formatTooltipTitle={(items) => {
        const point = items[0].raw as { rank: number };
        return ordinalSuffix(point.rank);
      }}
      formatTooltipLabel={(item) => {
        const point = item.raw as { y: number };
        return `Score: ${point.y}`;
      }}
    />
  );
};
