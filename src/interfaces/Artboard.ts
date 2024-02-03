import type { BitmapLayer } from "./BitmapLayer";

export interface Artboard {
  // status: ArtworkStatus;
  // id: string;
  // name: string;
  // metadata?: ArtworkMetadata;
  // src?: string;
  context?: CanvasRenderingContext2D;
  bitmapLayer: BitmapLayer;
  // modified: Date;
}
