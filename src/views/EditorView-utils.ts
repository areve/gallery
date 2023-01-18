import type { GalleryItem, HistoryItem, Metadata } from "./EditorView-interfaces"

export function extendMetadata(metadata: Metadata, historyItem: HistoryItem) {
  const result = JSON.parse(JSON.stringify(metadata))
  result.history = Array.isArray(result.history) ? result.history : [result.history]
  result.history.push(historyItem)
  return result
}

export function findErrorMessage(error: any): string {
  const result = error?.response?.data?.error?.message ||
    error?.message
  if (!result) {
    console.error(error)
  }
  return result || 'Unknown Error'
}

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    const tempImage = new Image()
    tempImage.onload = () => {
      resolve(tempImage)
    }
    tempImage.src = dataUrl
  })
}

export function getDatestamp() {
  return new Date()
    .toISOString()
    .replace(/[^\dTt\.]/g, '')
    .replace(/\..*/g, '')
}

export function epochToDate(epoch: number) {
  const createdDate = new Date(0);
  createdDate.setUTCSeconds(epoch);
  return createdDate
}

export function clone<T>(value: T) {
  return JSON.parse(JSON.stringify(value)) as T
}

export function getReverseHistory(item: GalleryItem) {
  return (Array.isArray(item.metadata.history) ? [...item.metadata.history] : [item.metadata.history]).reverse()
}