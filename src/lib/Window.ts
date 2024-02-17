import type { Coord } from "./Coord";

export function getAvailableSize(): Coord {
  return {
    x: Math.round(window.innerWidth * window.devicePixelRatio),
    y: Math.round(window.innerHeight * window.devicePixelRatio),
  };
}
