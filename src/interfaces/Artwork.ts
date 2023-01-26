import type { GalleryMetadata } from "./GalleryMetadata";
import type { Rect } from "./Rect";

export type Artwork =
  ArtworkFile |
  ArtworkActive |
  ArtworkWaiting |
  ArtworkDisplayed |
  ArtworkError |
  ArtworkDeleted

type ArtworkStatus = 'file' | 'active' | 'loading' | 'waiting' | 'displayed' | 'error' | 'deleted'

interface ArtworkBase {
  status: ArtworkStatus,
  filename: string
  metadata: GalleryMetadata // TODO rename to ArtworkMetadata?, and include modified time in here
}

export interface ArtworkFile extends ArtworkBase {
  status: 'file' | 'loading'
}

export interface ArtworkActive extends ArtworkBase {
  status: 'active'
  frame: Rect;
  bounds: Rect;
  mainContext: CanvasRenderingContext2D;
  overlayContext: CanvasRenderingContext2D;
}

export interface ArtworkWaiting extends ArtworkBase {
  status: 'waiting'
}

export interface ArtworkDisplayed extends ArtworkBase {
  status: 'displayed'
  image: HTMLImageElement | CanvasRenderingContext2D
}

export interface ArtworkError extends ArtworkBase {
  status: 'error'
  error: string
  // TODO desired state and more details?
}

export interface ArtworkDeleted extends ArtworkBase {
  status: 'deleted'
}

