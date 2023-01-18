export function createCanvas(width: number, height: number) {
  const result = document.createElement('canvas')
  result.width = width
  result.height = height
  return result
}

export function cloneCanvas(context: CanvasRenderingContext2D, x: number = 0, y: number = 0, w: number = 0, h: number = 0) {
  const width = w === 0 ? context.canvas.width : w
  const height = h === 0 ? context.canvas.height : h
  const imageData = context.getImageData(x, y, width, height)
  const result = createCanvas(width, height);
  result.getContext('2d')!.putImageData(imageData, 0, 0)
  return result;
}

