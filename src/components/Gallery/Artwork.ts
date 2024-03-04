export interface Artwork {
  blob?: Blob;
  id?: string;
  name: string;
  path?: string;
  thumbnailUrl?: string;
  createdTime?: Date;
  modifiedTime?: Date;
}

export interface ArtworkWithBlob extends Artwork {
  blob: Blob;
}
