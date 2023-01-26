import type { Rect } from "./Rect";

export interface Artwork {
  frame: Rect;
  bounds: Rect;
  documentContext: CanvasRenderingContext2D;
  overlayContext: CanvasRenderingContext2D;
}
