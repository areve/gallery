import type { ArtworkMetadata } from "./ArtworkMetadata";
import type { Rect } from "./Rect";
import type { RgbaLayer } from "./RgbaLayer";

type ArtworkStatus = "ready" | "waiting" | "error" | "deleted";

export interface Artwork {
  status: ArtworkStatus;
  filename: string;
  metadata: ArtworkMetadata;
  modified: Date;
}

export interface ArtworkWithDatesAsIso {
  status: ArtworkStatus;
  filename: string;
  metadata: ArtworkMetadata;
  modified: string;
}

export interface ArtworkInMemory extends Artwork {
  dataUrl: string;
}

export interface ArtworkActive
  extends Artwork,
    ArtworkOnCanvas,
    ArtworkOnRgbaLayer {
  frame: Rect;
  bounds: Rect;
  overlayContext: CanvasRenderingContext2D;
}

export interface ArtworkOnCanvas extends Artwork {
  context: CanvasRenderingContext2D;
}

export interface ArtworkOnRgbaLayer extends Artwork {
  rgbaLayer: RgbaLayer;
}

export interface ArtworkImage extends Artwork {
  image: HTMLImageElement;
}

export interface ArtworkError extends Artwork {
  status: "error";
  error: string;
}

export interface ArtworkDeleted extends Artwork {
  status: "deleted";
}
