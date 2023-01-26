import type { GalleryMetadata } from "./GalleryMetadata";
import type { Rect } from "./Rect";

export interface Artwork {
  filename: string;
  metadata: GalleryMetadata;
  frame: Rect;
  bounds: Rect;
  mainContext: CanvasRenderingContext2D;
  overlayContext: CanvasRenderingContext2D;
}
