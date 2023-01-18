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

