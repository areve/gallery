import type { ArtworkMetadata } from "./ArtworkMetadata";
import type { Rect } from "./Rect";

type ArtworkStatus = "ready" | "waiting" | "error" | "deleted";

export interface Artwork {
  status: ArtworkStatus;
  id: string;
  name: string;
  metadata?: ArtworkMetadata;
  src?: string;
  context?: CanvasRenderingContext2D;
  modified: Date;
}

export interface ArtworkInMemory extends Artwork {
  dataUrl: string;
}

export interface ArtworkActive extends ArtworkOnCanvas {
  frame: Rect;
  bounds: Rect;
  overlayContext: CanvasRenderingContext2D;
}

export interface ArtworkOnCanvas extends Artwork {
  context: CanvasRenderingContext2D;
}

export interface ArtworkImage extends Artwork {
  image: HTMLImageElement;
}

export interface ArtworkError extends Artwork {
  status: "error";
  error: string;
}

export interface ArtworkDeleted extends Omit<Artwork, "name"> {
  status: "deleted";
}
