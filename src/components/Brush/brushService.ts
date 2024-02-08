import { dispatch } from "../ArtboardPanel/artboardService";
import { brushToolState } from "./brushToolState";

export function setBrush(color: string, radius: number) {
  dispatch("brushService.setBrush", [color, radius]);

  brushToolState.value.color = color;
  brushToolState.value.radius = radius;
}
