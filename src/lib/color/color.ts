import type { ColorCoord } from "@/lib/Color";
import Color from "colorjs.io";
import { lerpOklchColor, oklch2srgb, srgb2oklch } from "./color-oklch";
import { lerpSrgbColor } from "./color-srgb";
import type { ColorSpace } from "../BitmapLayer";

export function color2srgb(value: string) {
  const split = value.split(":");
  const color = new Color(split[0]);
  if (split[1]) color.alpha = parseFloat(split[1]);
  return [...color.srgb, color.alpha] as ColorCoord;
}

export function colorConverter(from: ColorSpace, to: ColorSpace) {
  if (from === to) return (color: ColorCoord) => color;
  if (from === "srgb" && to === "oklch") return srgb2oklch;
  if (from === "oklch" && to === "srgb") return oklch2srgb;
  throw "unsupported getColorConvertFunction: " + from + " to " + to;
}

export function colorMixer(space: ColorSpace) {
  if (space === "oklch") return lerpOklchColor;
  if (space === "srgb") return lerpSrgbColor;
  throw "unsupported getColorMixFunction: " + space;
}
