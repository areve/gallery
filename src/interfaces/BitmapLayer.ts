import type { Rect } from "./Rect";

export type ColorSpace = "oklch";

export interface BitmapLayer {
  data: Float32Array;
  width: number;
  height: number;
  channels: number;
  space: ColorSpace;
  dirty: Rect[];
  tiles: Rect[];
}

export interface OklchBitmapLayer extends BitmapLayer {
  space: "oklch";
}
