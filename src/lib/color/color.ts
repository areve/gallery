import type { ColorSpace } from "@/interfaces/BitmapLayer";
import type { ColorCoord } from "@/interfaces/Color";
import Color from "colorjs.io";
import { oklch2srgb, srgb2oklch } from "./color-oklch";

export function color2srgb(value: string) {
  const color = new Color(value);
  return [...color.srgb, color.alpha] as ColorCoord;
}

export function convertColor(from: ColorSpace, to: ColorSpace, color: ColorCoord) {
  if (from === to) return color;
  if (from === "srgb" && to === "oklch") return srgb2oklch(color);
  if (from === "oklch" && to === "srgb") return oklch2srgb(color);
  throw "unsupported convertColor: " + from + " to " + to;
}
