import { brushToolState } from "./brushToolState";

export function setBrush(color: string, radius: number) {
  brushToolState.value.color = color;
  brushToolState.value.radius = radius;
}
