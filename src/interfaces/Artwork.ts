import type { GalleryMetadata } from "./GalleryMetadata";
import type { Rect } from "./Rect";

export interface Artwork {
  filename: string;
  metadata: GalleryMetadata;
  frame: Rect;
  bounds: Rect;
  documentContext: CanvasRenderingContext2D;
  overlayContext: CanvasRenderingContext2D;
}
