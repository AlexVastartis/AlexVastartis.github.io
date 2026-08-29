import { scaleLinear, type ScaleLinear } from 'd3-scale';

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_MARGINS: Margins = { top: 28, right: 28, bottom: 52, left: 64 };

export interface Scales {
  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
  xTicks: number[];
  yTicks: number[];
}

export function linearScales(
  xs: number[],
  ys: number[],
  width: number,
  height: number,
  margins: Margins = DEFAULT_MARGINS,
): Scales {
  const x = scaleLinear()
    .domain([0, Math.max(1, ...xs)])
    .nice()
    .range([margins.left, width - margins.right]);
  const y = scaleLinear()
    .domain([0, Math.max(1, ...ys)])
    .nice()
    .range([height - margins.bottom, margins.top]);
  return {
    x,
    y,
    xTicks: x.ticks(10).filter((t) => t >= 0),
    yTicks: y.ticks(8).filter((t) => t >= 0),
  };
}
