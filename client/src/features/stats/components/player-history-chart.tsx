import { type Component, createMemo } from "solid-js";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { CHART_LINE_COLOUR } from "../constants";
import { ChartComponent } from "./chart";

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
      datasets={[{ data: data(), colour: CHART_LINE_COLOUR }]}
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
