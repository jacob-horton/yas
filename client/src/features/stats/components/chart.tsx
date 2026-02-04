import Chart, { type ScriptableContext } from "chart.js/auto";
import {
  type Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { ordinalSuffix } from "@/lib/ordinal-suffix";

function calculateBackgroundGradient(context: ScriptableContext<"line">) {
  const chart = context.chart;
  const { ctx, chartArea } = chart;

  // If chart isn't ready, just return solid colour for now
  if (!chartArea) {
    return "oklch(49.6% 0.265 301.924 / 0.4)";
  }

  // Create gradient that's the height of the chart
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.top,
    0,
    chartArea.bottom,
  );

  gradient.addColorStop(0, "oklch(49.6% 0.265 301.924 / 0.5)");
  gradient.addColorStop(1, "oklch(49.6% 0.265 301.924 / 0.0)");

  return gradient;
}

type DataPoint = { score: number; rank: number };

export type ChartProps = {
  data: DataPoint[];
};

export const ChartComponent: Component<ChartProps> = (props) => {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement | undefined>(
    undefined,
  );
  const [chart, setChart] = createSignal<Chart | null>(null);

  onMount(() => {
    const ctx = canvas()?.getContext("2d");
    if (!ctx) return;

    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Score",
            parsing: { key: "score" },
            data: props.data.map((d, i) => ({
              y: d.score,
              x: i,
              rank: d.rank,
            })),
            backgroundColor: calculateBackgroundGradient,
            borderColor: "oklch(54.1% 0.281 293.009)",
            fill: true,
            borderWidth: 5,
            pointRadius: 8,
            pointHoverRadius: 8,
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "oklch(54.1% 0.281 293.009)",
            pointHoverBorderWidth: 3,
          },
        ],
      },
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
          mode: "index",
          intersect: false,
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
              title: (tooltipItems) => {
                const raw = tooltipItems[0].raw as { rank: number };
                return ordinalSuffix(raw.rank);
              },

              label: (context) => {
                const raw = context.raw as { y: number };
                return `Score: ${raw.y}`;
              },
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
    const currentData = props.data;

    if (activeChart) {
      activeChart.data.datasets[0].data = currentData.map((d, i) => ({
        y: d.score,
        x: i,
        rank: d.rank,
      }));

      if (activeChart.data.labels?.length !== currentData.length) {
        activeChart.data.labels = Array.from(Array(currentData.length).keys());
      }

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
