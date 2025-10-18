export function snapToGrid(value: number, step = 1) {
  return Math.round(value / step) * step;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
