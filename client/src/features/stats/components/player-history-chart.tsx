import { type Component, createMemo } from "solid-js";
import { ordinalSuffix } from "@/lib/ordinal-suffix";
import { CHART_LINE_COLOUR } from "../constants";
import { ChartComponent } from "./chart";
import { ChartTooltip } from "./chart-tooltip";

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
      ariaLabel="Line chart of this player's scores"
      datasets={[{ data: data(), colour: CHART_LINE_COLOUR }]}
      renderTooltip={(chartProps) => (
        <ChartTooltip anchorPos={chartProps.anchorPos}>
          <div class="text-sm">
            {ordinalSuffix(chartProps.activePoint.rank)}
          </div>
          <div>Score: {chartProps.activePoint.y}</div>
        </ChartTooltip>
      )}
    />
  );
};
