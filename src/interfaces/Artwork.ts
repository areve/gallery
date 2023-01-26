import type { ArtworkMetadata } from "./ArtworkMetadata";
import type { Rect } from "./Rect";

export type Artwork =
  ArtworkFile |
  ArtworkActive |
  ArtworkWaiting |
  ArtworkDisplayed |
  ArtworkError |
  ArtworkDeleted

type ArtworkStatus = 'file' | 'active' | 'loading' | 'waiting' | 'displayed' | 'error' | 'deleted'

export interface ArtworkBase {
  status: ArtworkStatus,
  filename: string
  metadata: ArtworkMetadata
}

export interface ArtworkFile extends ArtworkBase {
  status: 'file' | 'loading'
}

export interface ArtworkInMemory extends ArtworkBase {
  dataUrl: string
}

export interface ArtworkActive extends ArtworkBase, ArtworkExportable {
  status: 'active'
  frame: Rect;
  bounds: Rect;
  mainContext: CanvasRenderingContext2D;
  overlayContext: CanvasRenderingContext2D;
}

export interface ArtworkWaiting extends ArtworkBase {
  status: 'waiting'
}

export interface ArtworkDisplayed extends ArtworkBase, ArtworkExportable {
  status: 'displayed'
  context: CanvasRenderingContext2D
}

export interface ArtworkError extends ArtworkBase {
  status: 'error'
  error: string
  // TODO desired state and more details?
}

export interface ArtworkDeleted extends ArtworkBase {
  status: 'deleted'
}
export interface ArtworkExportable extends ArtworkBase {
  toDataURL(): string
}

