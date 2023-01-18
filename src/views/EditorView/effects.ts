import { cloneContext } from "./canvas";

export function shotgunEffect(context: CanvasRenderingContext2D) {
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * context.canvas.width
    const y = Math.random() * context.canvas.height
    context.beginPath();

    const radius = 8
    context.arc(x, y, radius / 2, 0, 2 * Math.PI, false);
    context.save();
    context.clip();
    context.clearRect(x - radius / 2, y - radius / 2, radius, radius)
    context.restore();
  }
}

export async function scaleImage(context: CanvasRenderingContext2D, by: number) {
  const clone = cloneContext(context)
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)

  context.drawImage(
    clone.canvas,
    (context.canvas.width - clone.canvas.width * by) / 2,
    (context.canvas.height - clone.canvas.height * by) / 2,
    clone.canvas.width * by,
    clone.canvas.height * by)
}

export async function autoCrop(context: CanvasRenderingContext2D) {
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

