import type { Rect } from "./Rect";

export type ColorSpace = "oklch" | "srgb";

export interface BitmapLayer {
  data: Float32Array;
  width: number;
  height: number;
  channels: number;
  alphaChannel: number;
  space: ColorSpace;
  dirty: Rect[];
  tiles: Rect[];
}

export interface OklchBitmapLayer extends BitmapLayer {
  space: "oklch";
}
export interface SrgbBitmapLayer extends BitmapLayer {
  space: "srgb";
}
