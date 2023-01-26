import type { ArtworkMetadata } from "./ArtworkMetadata";
import type { Rect } from "./Rect";

type ArtworkStatus = 'file' | 'active' | 'loading' | 'waiting' | 'displayed' | 'error' | 'deleted' | 'inmemory'

export interface Artwork {
  status: ArtworkStatus,
  filename: string
  metadata: ArtworkMetadata
}

export interface ArtworkFile extends Artwork {
  status: 'file' | 'loading'
}

export interface ArtworkInMemory extends Artwork {
  status: 'inmemory' // TODO not really a status
  dataUrl: string
}

export interface ArtworkActive extends Artwork, ArtworkDisplayed {
  status: 'displayed'
  frame: Rect;
  bounds: Rect;
  overlayContext: CanvasRenderingContext2D;
}

export interface ArtworkWaiting extends Artwork {
  status: 'waiting'
}

// TODO rename ArtworkDisplay? 
export interface ArtworkDisplayed extends Artwork {
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
