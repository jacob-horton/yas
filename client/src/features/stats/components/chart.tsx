import {
  type Component,
  createMemo,
  createSignal,
  For,
  type JSX,
  Show,
} from "solid-js";

export type DataPoint = { x: number; y: number } & Record<string, any>;
export type Dataset = { label?: string; data: DataPoint[]; colour: string };
export type ActivePoint = DataPoint & {
  datasetLabel?: string;
  datasetColor: string;
};

export type ChartProps = {
  ariaLabel?: string;
  datasets: Dataset[];
  renderTooltip?: (props: {
    activePoint: ActivePoint;
    anchorPos: { left: string; top: string };
  }) => JSX.Element;
};

const getSafeMax = (vals: number[], fallback = 100) => {
  const max = Math.max(...vals, 0);
  return max > 0 ? max : fallback;
};

const getNiceScale = (rawMax: number) => {
  // If data is all 0, default to 1 so we have a visible coordinate space
  const val = rawMax <= 0 ? 1 : rawMax;

  // Find the magnitude (e.g., 0.1, 1, 10, 100)
  const exponent = Math.floor(Math.log10(val));
  const magnitude = 10 ** exponent;
  const fraction = val / magnitude;

  // Pick a clean "step" multiplier
  let stepMultiplier: number;
  if (fraction <= 1.5)
    stepMultiplier = 0.2; // Steps of 0.2, 0.4...
  else if (fraction <= 3)
    stepMultiplier = 0.5; // Steps of 0.5, 1.0...
  else if (fraction <= 7)
    stepMultiplier = 1; // Steps of 1, 2...
  else stepMultiplier = 2; // Steps of 2, 4...

  const step = stepMultiplier * magnitude;

  // Find the totalMax by taking the smallest multiple of 'step'
  // that is >= val AND results in at least 5 ticks.
  // To keep exactly 5 intervals (6 lines), we do:
  const totalMax = Math.ceil(val / (step * 5)) * (step * 5);

  return {
    totalMax,
    step: totalMax / 5,
  };
};

export const ChartComponent: Component<ChartProps> = (props) => {
  const [active, setActive] = createSignal<{
    point: ActivePoint;
    pos: { left: string; top: string };
  } | null>(null);

  const scale = createMemo(() => {
    const rawMax = Math.max(
      ...props.datasets.flatMap((d) => d.data.map((p) => p.y)),
      0,
    );
    return getNiceScale(rawMax);
  });

  const maxY = () => scale().totalMax;
  const maxX = createMemo(() =>
    getSafeMax(
      props.datasets.map((d) => d.data.length - 1),
      1,
    ),
  );

  const yTicks = createMemo(() => {
    const { step } = scale();
    return Array.from({ length: 6 }, (_, i) => i * step);
  });

  const chartPaths = createMemo(() =>
    props.datasets.map((ds) => {
      const points = ds.data.map(
        (p, i) => `${(i / maxX()) * 100},${100 - (p.y / maxY()) * 100}`,
      );
      const line = `M ${points.join(" L ")}`;
      return {
        ...ds,
        line,
        area: points.length ? `${line} V 100 H 0 Z` : "",
      };
    }),
  );

  const onPointerMove = (e: PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const index = Math.round(xPct * maxX());

    let bestMatch: ActivePoint | null = null;
    let minHoverDist = Infinity;
    let finalTop = "0%";

    for (const ds of props.datasets) {
      const point = ds.data[index];
      if (!point) continue;

      const yPct = 100 - (point.y / maxY()) * 100;
      const mouseRelY = ((e.clientY - rect.top) / rect.height) * 100;
      const dist = Math.abs(yPct - mouseRelY);

      if (dist < minHoverDist) {
        minHoverDist = dist;
        bestMatch = {
          ...point,
          datasetLabel: ds.label,
          datasetColor: ds.colour,
        };
        finalTop = `${yPct}%`;
      }
    }

    if (bestMatch) {
      setActive({
        point: bestMatch,
        pos: {
          left: `${(index / maxX()) * 100}%`,
          top: finalTop,
        },
      });
    }
  };

  return (
    <div class="flex h-[200px] w-full select-none font-sans md:h-[500px]">
      <div class="relative w-10 shrink-0">
        <For each={yTicks()}>
          {(tick) => (
            <span
              class="absolute right-2 translate-y-1/2 text-gray-400 text-xs"
              style={{ bottom: `${(tick / maxY()) * 100}%` }}
            >
              {tick}
            </span>
          )}
        </For>
      </div>

      {/* Chart Canvas */}
      <div
        class="relative flex-1 touch-none"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
      >
        {/* Grid */}
        <div class="pointer-events-none absolute inset-0">
          <For each={yTicks()}>
            {(tick) => (
              <div
                class="absolute w-full border-gray-100 border-b"
                style={{ bottom: `${(tick / maxY()) * 100}%` }}
              />
            )}
          </For>
        </div>

        {/* Chart Line */}
        <svg
          class="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          role="img"
          aria-label={props.ariaLabel ?? "Data visualization chart"}
        >
          <For each={chartPaths()}>
            {(ds, i) => (
              <g class="transition-opacity duration-300">
                <defs>
                  <linearGradient id={`g-${i()}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stop-color={ds.colour}
                      stop-opacity="0.8"
                    />
                    <stop
                      offset="100%"
                      stop-color={ds.colour}
                      stop-opacity="0"
                    />
                  </linearGradient>
                </defs>
                <path d={ds.area} fill={`url(#g-${i()})`} />
                <path
                  d={ds.line}
                  fill="none"
                  stroke={ds.colour}
                  stroke-width="5"
                  vector-effect="non-scaling-stroke"
                />
              </g>
            )}
          </For>
        </svg>

        {/* Hover dot and tooltip */}
        <Show when={active()}>
          {(state) => (
            <>
              <div
                class="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute size-5 rounded-full border-[4px] bg-white transition-all duration-75 ease-out"
                style={{
                  left: state().pos.left,
                  top: state().pos.top,
                  "border-color": state().point.datasetColor,
                }}
              />
              {props.renderTooltip?.({
                get activePoint() {
                  return state().point;
                },
                get anchorPos() {
                  return state().pos;
                },
              })}
            </>
          )}
        </Show>
      </div>
    </div>
  );
};
