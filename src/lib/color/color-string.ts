import type { ColorCoord } from "@/interfaces/Color";
import Color from "colorjs.io";

export function color2srgb(value: string) {
  const color = new Color(value);
  return [...color.srgb, color.alpha] as ColorCoord;
}
