export function createContext(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d')!
}

export function cloneContext(context: CanvasRenderingContext2D, x: number = 0, y: number = 0, w: number = 0, h: number = 0) {
  const width = w === 0 ? context.canvas.width : w
  const height = h === 0 ? context.canvas.height : h
  const imageData = context.getImageData(x, y, width, height)
  const result = createContext(width, height);
  result.putImageData(imageData, 0, 0)
  return result;
}


export async function autoCropImage(context: CanvasRenderingContext2D) {
  const w = context.canvas.width
  const h = context.canvas.height
  const imageData = context.getImageData(0, 0, w, h)
  const pix = imageData.data;
  let minX = w
  let maxX = 0
  let minY = h
  let maxY = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = pix[(y * w + x) * 4 + 0]
      if (a > 0) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  return cloneContext(context, minX, minY, maxX + 1 - minX, maxY + 1 - minY)
}
