import type { Artwork, ArtworkBase, ArtworkError } from "@/interfaces/Artwork"
import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata"
import type { HistoryItem } from "@/interfaces/HistoryItem"
import type { Rect } from "@/interfaces/Rect"

export function extendMetadata(metadata: ArtworkMetadata, historyItem: HistoryItem) {
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

export function getReverseHistory(item: ArtworkBase) {
  return clone([...item.metadata.history].reverse())
}

export function mostRecentPrompt(item: ArtworkBase): string {
  const history = getReverseHistory(item)
  return (history.filter((item: any) => 'prompt' in item)[0] as any).prompt || ''
}

export function mostRecentError(item: ArtworkBase | ArtworkError): string {
  const history = getReverseHistory(item)
  return (item as any).error || history.filter(item => item?.error)[0]?.error || ''
}

export function rectanglesIntersect(a: Rect, b: Rect) {
  const isLeft = a.x + a.width < b.x
  const isRight = a.x > b.x + b.width
  const isAbove = a.y > b.y + b.height
  const isBelow = a.y + a.height < b.y
  return !(isLeft || isRight || isAbove || isBelow)
}