export interface Artwork {
  blob?: Blob;
  id?: string;
  name: string;
  path: string;
  thumbnailUrl?: string;
}

export interface ArtworkWithBlob extends Artwork {
  blob: Blob;
}
