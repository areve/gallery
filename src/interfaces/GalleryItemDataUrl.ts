import type { GalleryMetadata } from "./GalleryMetadata";


export interface GalleryItemDataUrl {
  filename: string;
  status: 'error' | 'loading' | 'saved';
  error?: string;
  metadata: GalleryMetadata;
  modified?: Date;
  dataUrl: string;
}
