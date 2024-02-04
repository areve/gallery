import type { ColorCoord } from "@/interfaces/Color";
import { lerp } from "../lerp";

export function lerpSrgbColor(color1: ColorCoord, color2: ColorCoord): ColorCoord {
  if (color1[3] === 0) return color2;
  if (color2[3] === 0) return color1;

  const alpha = lerp(color1[3], 1, color2[3]);
  const r = lerp(color1[0], color2[0], alpha);
  const g = lerp(color1[1], color2[1], alpha);
  const b = lerp(color1[2], color2[2], alpha);

  return [r, g, b, alpha];
}
