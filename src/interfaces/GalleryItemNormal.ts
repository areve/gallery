import type { GalleryMetadata } from "./GalleryMetadata";


export interface GalleryItemNormal {
  filename: string;
  status: 'error' | 'loading' | 'saved' | 'deleted';
  error?: string;
  metadata: GalleryMetadata;
  modified?: Date;
}
