import type { BitmapLayer } from "./BitmapLayer";

export interface Artboard {
  context?: CanvasRenderingContext2D;
  bitmapLayer: BitmapLayer;
}
