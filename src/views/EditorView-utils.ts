import type { GalleryItem, HistoryItem, GalleryMetadata } from "./EditorView-interfaces"

export function extendMetadata(metadata: GalleryMetadata, historyItem: HistoryItem) {
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
  return clone([...item.metadata.history].reverse())
}

export function mostRecentPrompt(item: GalleryItem): string {
  const history = getReverseHistory(item)
  return (history.filter((item: any) => 'prompt' in item)[0] as any).prompt || ''
}

export function mostRecentError(item: GalleryItem): string {
  const history = getReverseHistory(item)
  return history.filter(item => item?.error)[0]?.error || ''
}