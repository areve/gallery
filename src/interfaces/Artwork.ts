import type { ArtworkMetadata } from "./ArtworkMetadata";
import type { Rect } from "./Rect";

type ArtworkStatus = 'ready' | 'waiting' | 'error' | 'deleted' 

export interface Artwork {
  status: ArtworkStatus,
  filename: string
  metadata: ArtworkMetadata
}

export interface ArtworkInMemory extends Artwork {
  dataUrl: string
}

export interface ArtworkActive extends Artwork, ArtworkOnCanvas {
  frame: Rect;
  bounds: Rect;
  overlayContext: CanvasRenderingContext2D;
}

export interface ArtworkOnCanvas extends Artwork {
  context: CanvasRenderingContext2D
}

export interface ArtworkError extends Artwork {
  status: 'error'
  error: string
}

export interface ArtworkDeleted extends Artwork {
  status: 'deleted'
}
