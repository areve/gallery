import { cloneContext } from "./canvas";
import Color from 'color';


export function clearCircle(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.save();
  context.clip();
  context.clearRect(x - radius, y - radius, radius * 2, radius * 2)
  context.restore();
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

export async function drawPencil(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, from: { x: number, y: number } | null) {
  if (!from) return
  const dx = x - from.x
  const dy = y - from.y
  const d = Math.sqrt((dy * dy + dx * dx))

  const w = context.canvas.width
  const h = context.canvas.height
  const imageData = context.getImageData(0, 0, w, h)
  const pix = imageData.data;
  const c = Color(color)
  
  let { r, g, b, a } = c.object()

  // TODO this is a mega inefficient way of painting a blurry line, but kind of works
  const step =  radius / d 
  for (let n = 0; n <= 1; n += step) {
    drawPencilDot(pix, x - dx * n, y - dy * n, radius, color, w, h, r, g, b)
  }
  context.putImageData(imageData, 0, 0)
}
export async function drawPencilDot(pix: Uint8ClampedArray, x: number, y: number, radius: number, color: string, w: number, h: number, r: number, g: number, b: number) {
 
  x = ~~x
  y = ~~y
  
  for (let y1 = y - radius; y1 < y + radius; y1++) {
    for (let x1 = x - radius; x1 < x + radius; x1++) {
      const dx = x1 - x
      const dy = y1 - y
      const d = Math.max(radius - Math.sqrt((dy * dy + dx * dx)), 0) / radius

      const rN = (y1 * w + x1) * 4 + 0
      const gN = (y1 * w + x1) * 4 + 1
      const bN = (y1 * w + x1) * 4 + 2
      const aN = (y1 * w + x1) * 4 + 3
      const r0 = pix[rN]
      const g0 = pix[gN]
      const b0 = pix[bN]
      const weight = 0.4 * d
      const invWeight = 1 - weight
      const r1 = (r0 * invWeight + r * weight) 
      const g1 = (g0 * invWeight + g * weight) 
      const b1 = (b0 * invWeight + b * weight) 
      pix[rN] = r1
      pix[gN] = g1
      pix[bN] = b1
      pix[aN] = 255
    }
  }
  
}

export async function drawCircle(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, from: { x: number, y: number } | null) {
  const ctx = context
  ctx.lineWidth = radius * 2
  ctx.strokeStyle = color
  ctx.lineCap = 'round'

  ctx.beginPath();
  ctx.moveTo(from?.x || x, from?.y || y);
  ctx.lineTo(x, y);
  ctx.stroke();
}