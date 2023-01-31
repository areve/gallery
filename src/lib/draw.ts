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

  const w = context.canvas.width
  const h = context.canvas.height
  const imageData = context.getImageData(0, 0, w, h)
  const pix = imageData.data;

  brushLine1(pix, w, h, from, { x, y }, radius, color)
  // sprayLine1(pix, w, h, from, { x, y }, radius, color)
  // TODO this is a mega inefficient way of painting a blurry line, but kind of works
  context.putImageData(imageData, 0, 0)
}

interface Coord { x: number, y: number }

function brushLine1(pix: Uint8ClampedArray, width: number, height: number, from: Coord, to: Coord, radius: number, color: string) {

  const brushWidth = radius * 2
  const brushHeight = brushWidth
  const brush: Uint8ClampedArray = new Uint8ClampedArray(brushWidth * brushHeight * 4);


  for (let y = 0; y < brushHeight; y++) {
    for (let x = 0; x < brushWidth; x++) {
      const rN = (y * brushWidth + x) * 4
      const gN = rN + 1
      const bN = rN + 2
      const aN = rN + 3

      const dx = x - radius
      const dy = y - radius
      const d = Math.sqrt(dy * dy + dx * dx)
      const val = d / radius

      brush[rN] = val * 255
      brush[gN] = val * 255
      brush[bN] = val * 255
      brush[aN] = val * 255
    }
  }
  const minX = Math.max(0, Math.min(Math.floor(from.x), Math.floor(to.x)) - radius)
  const maxX = Math.min(width, Math.max(Math.floor(from.x), Math.floor(to.x)) + radius)
  const minY = Math.max(0, Math.min(Math.floor(from.y), Math.floor(to.y)) - radius)
  const maxY = Math.min(height, Math.max(Math.floor(from.y), Math.floor(to.y)) + radius)

  const dx = from.x - to.x
  const dy = from.y - to.y
  const d = Math.sqrt(dy * dy + dx * dx)

  for (let i = 0; i < d; i++) {
    const x = Math.floor(to.x + i / d * dx)
    const y = Math.floor(to.y + i / d * dy)
    copyBrush(pix, width, height, brush, brushWidth, brushHeight, x, y, color)
  }
}

function copyBrush(pix: Uint8ClampedArray, width: number, height: number, brush: Uint8ClampedArray, brushWidth: number, brushHeight: number, x: number, y: number, color: string) {
  let c = Color(color)
  let { r, g, b, a } = c.object()

  for (let bY = 0; bY < brushHeight; bY++) {
    for (let bX = 0; bX < brushWidth; bX++) {
      const rN = (bY * brushWidth + bX) * 4
      const gN = rN + 1
      const bN = rN + 2
      const aN = rN + 3

      const orN = (width * (y + bY - brushHeight / 2) + x + bX - brushWidth / 2) * 4
      const ogN = orN + 1
      const obN = orN + 2
      const oaN = orN + 3

      pix[orN] = mix(pix[orN], r, brush[aN])
      pix[ogN] = mix(pix[ogN], g, brush[aN])
      pix[obN] = mix(pix[obN], b, brush[aN])
      pix[oaN] = 255
    }
  }
}
function mix(a: number, b: number, n: number) {
  //  return a * brush / 255 + b * (255 - brush) / 255
  // return 255 / 2
  return n / 255 * a + (255 - n) / 255 * b
}

function sprayLine1(pix: Uint8ClampedArray, width: number, height: number, from: Coord, to: Coord, radius: number, color: string) {
  const c = Color(color)
  let { r, g, b, a } = c.object()
  const dx = to.x - from.x
  const dy = to.y - from.y
  const d = Math.sqrt((dy * dy + dx * dx))
  const step = radius / d
  for (let n = 0; n <= 1; n += step) {
    drawPencilDot(pix, width, to.x - dx * n, to.y - dy * n, radius, r, g, b)
  }
}

export async function drawPencilDot(pix: Uint8ClampedArray, w: number, x: number, y: number, radius: number, r: number, g: number, b: number) {

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