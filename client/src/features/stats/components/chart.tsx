import Chart, {
  type InteractionMode,
  type ScriptableContext,
  type TooltipItem,
} from "chart.js/auto";
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

function getBackgroundGradient(baseColor: string) {
  return (context: ScriptableContext<"line">) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;

    if (!chartArea) {
      return `oklch(from ${baseColor} l c h / 0.8)`;
    }

    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom,
    );

    gradient.addColorStop(0, `oklch(from ${baseColor} l c h / 0.8)`);
    gradient.addColorStop(1, `oklch(from ${baseColor} l c h / 0)`);

    return gradient;
  };
}

type DataPoint = { x: number; y: number };
type LineChart = Chart<"line", DataPoint[]>;
type Dataset = {
  label?: string;
  data: DataPoint[];
  colour: string;
};

export type ChartProps = {
  datasets: Dataset[];

  formatTooltipTitle?: (
    tooltipItems: TooltipItem<"line">[],
  ) => string | string[];
  formatTooltipLabel?: (tooltipItem: TooltipItem<"line">) => string | string[];

  interactionMode?: InteractionMode;
  interactionIntersect?: boolean;
};

export const ChartComponent: Component<ChartProps> = (props) => {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement | undefined>(
    undefined,
  );
  const [chart, setChart] = createSignal<LineChart | null>(null);

  const datasets = createMemo(() => {
    return props.datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: getBackgroundGradient(dataset.colour),
      borderColor: dataset.colour,
      fill: true,
      borderWidth: 5,
      pointRadius: 8,
      pointHoverRadius: 8,
      pointBackgroundColor: "rgba(0, 0, 0, 0)",
      pointBorderColor: "rgba(0, 0, 0, 0)",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: dataset.colour,
      pointHoverBorderWidth: 3,
    }));
  });

  onMount(() => {
    const ctx = canvas()?.getContext("2d");
    if (!ctx) return;

    const newChart = new Chart(ctx, {
      type: "line",
      data: { datasets: datasets() },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animations: {
          y: {
            duration: 750,
            easing: "easeOutQuart",
            from: (ctx) => {
              if (ctx.type === "data") {
                if (ctx.chart.scales.y) {
                  return ctx.chart.scales.y.getPixelForValue(0);
                }
                return ctx.chart.height;
              }
            },
          },
          x: {
            duration: 0,
          },
        },
        interaction: {
          mode: props.interactionMode || "index",
          intersect: props.interactionIntersect ?? false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            titleColor: "#000",
            bodyColor: "#000",
            borderColor: "#f0f0f0",
            borderWidth: 1,
            displayColors: false,
            padding: 10,

            bodyFont: {
              family: "Poppins",
              size: 14,
              weight: "bold",
            },

            callbacks: {
              title: props.formatTooltipTitle,
              label: props.formatTooltipLabel,
            },
          },
        },
        scales: {
          x: { display: false },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: "#eee" },
            ticks: {
              color: "#777",
              font: { family: "Poppins" },
              padding: 10,
              maxTicksLimit: 10,
            },
          },
        },
      },
    });

    setChart(newChart);
  });

  createEffect(() => {
    const activeChart = chart();
    const currentDatasets = datasets();

    if (activeChart && currentDatasets.length > 0) {
      activeChart.data.datasets = currentDatasets;

      const maxPoints = Math.max(...currentDatasets.map((d) => d.data.length));

      activeChart.data.labels = Array.from({ length: maxPoints }, (_, i) => i);

      activeChart.update();
    }
  });

  onCleanup(() => {
    const activeChart = chart();
    if (activeChart) {
      activeChart.destroy();
    }
  });

  return (
    <div class="relative h-[500px] w-full">
      <canvas ref={setCanvas} class="h-full! w-full!" />
    </div>
  );
};
