export interface Metadata {
  history: HistoryItem[]
}

export interface HistoryItem {
  method: 'createImage' | 'createImageEdit' | 'createImageVariation'
  prompt?: string
  filename: string
  version: 'OpenAI'
  created?: string;
}

export interface GalleryItem {
  filename: string,
  status: 'error' | 'loading' | 'ready',
  text: string
  metadata?: Metadata
  dataUrl?: string
}