export function extendMetadata(metadata: Metadata, historyItem: HistoryItem) {
    const result = JSON.parse(JSON.stringify(metadata))
    result.history = Array.isArray(result.history) ? result.history : [result.history]
    result.history.push(historyItem)
    return result
  }
  
export function findErrorMessage(error: any) {
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
  
export function createCanvas(width: number, height: number) {
    const result = document.createElement('canvas')
    result.width = width
    result.height = height
    return result
  }
  
export function cloneCanvas(canvas: HTMLCanvasElement, x: number = 0, y: number = 0, w: number = 0, h: number = 0) {
    const width = w === 0 ? canvas.width : w
    const height = h === 0 ? canvas.height : h
    const imageData = canvas.getContext('2d')!.getImageData(x, y, width, height)
    const result = createCanvas(width, height);
    result.getContext('2d')!.putImageData(imageData, 0, 0)
    return result;
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