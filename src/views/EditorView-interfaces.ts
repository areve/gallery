export interface GalleryMetadata {
  history: HistoryItem[]
}

export type HistoryItem = HistoryItemGeneration | HistoryItemEdit | HistoryItemVariation
export interface HistoryItemGeneration {
  method: 'createImage'
  error?: string
  prompt: string
  filename: string
  version: 'OpenAI'
  created?: string;
}
export interface HistoryItemEdit {
  method:  'createImageEdit'
  error?: string
  prompt: string
  filename: string
  image: Blob,
  mask: Blob,
  version: 'OpenAI'
  created?: string;
}

export interface HistoryItemVariation {
  method: 'createImageVariation'
  error?: string
  filename: string
  image: Blob,
  version: 'OpenAI'
  created?: string;
}

export type GalleryItem = GalleryItemNormal | GalleryItemDataUrl


export interface GalleryItemNormal {
  filename: string,
  status: 'error' | 'loading' | 'saved' | 'deleted',
  error?: string
  metadata: GalleryMetadata
  modified?: Date
}

export interface GalleryItemDataUrl {
  filename: string,
  status: 'error' | 'loading' | 'saved',
  error?: string
  metadata: GalleryMetadata
  modified?: Date
  dataUrl: string
}

export interface OpenAiResponse {

  data: OpenAiImage[]
}
export interface OpenAiImage {

  b64_json?: string 
}


export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export type Tools = 'pen' | 'drag' | 'drag-frame'

export interface DragOrigin {
  x: number;
  y: number;
  data: ImageData;
  frame: Rect;
}
