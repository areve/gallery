import type { ArtworkMetadata } from "./ArtworkMetadata";
import type { Rect } from "./Rect";

type ArtworkStatus = 'file' | 'active' | 'loading' | 'waiting' | 'displayed' | 'error' | 'deleted'

export interface Artwork {
  status: ArtworkStatus,
  filename: string
  metadata: ArtworkMetadata
}

export interface ArtworkFile extends Artwork {
  status: 'file' | 'loading'
}

export interface ArtworkInMemory extends Artwork {
  dataUrl: string
}

export interface ArtworkActive extends Artwork, ArtworkExportable {
  status: 'active'
  frame: Rect;
  bounds: Rect;
  mainContext: CanvasRenderingContext2D;
  overlayContext: CanvasRenderingContext2D;
}

export interface ArtworkWaiting extends Artwork {
  status: 'waiting'
}

export interface ArtworkDisplayed extends Artwork, ArtworkExportable {
  status: 'displayed'
  context: CanvasRenderingContext2D
}

export interface ArtworkError extends Artwork {
  status: 'error'
  error: string
}

export interface ArtworkDeleted extends Artwork {
  status: 'deleted'
}
export interface ArtworkExportable extends Artwork {
  toDataURL(): string
}

