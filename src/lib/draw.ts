import { cloneContext } from "./canvas";
import Color from "color";

export function clearCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.save();
  context.clip();
  context.clearRect(x - radius, y - radius, radius * 2, radius * 2);
  context.restore();
}

export async function scaleImage(
  context: CanvasRenderingContext2D,
  by: number
) {
  const clone = cloneContext(context);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  context.drawImage(
    clone.canvas,
    (context.canvas.width - clone.canvas.width * by) / 2,
    (context.canvas.height - clone.canvas.height * by) / 2,
    clone.canvas.width * by,
    clone.canvas.height * by
  );
}

export async function drawPencil(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  from: { x: number; y: number } | null,
  force: number
) {
  if (!from) return;

  const w = context.canvas.width;
  const h = context.canvas.height;
  const imageData = context.getImageData(0, 0, w, h);
  const pix = imageData.data;

  const c = Color(color);
  const { r, g, b, a } = c.object();

  const col = [r, g, b, a] as [number, number, number, number];

  brushLine1(pix, w, h, from, { x, y }, radius, col, force);
  context.putImageData(imageData, 0, 0);
}

// TODO this method of creating brush once works but is really messy
let brush: Uint8ClampedArray | null = null;

interface Coord {
  x: number;
  y: number;
}

function brushLine1(
  pix: Uint8ClampedArray,
  width: number,
  height: number,
  from: Coord,
  to: Coord,
  radius: number,
  color: [number, number, number, number],
  force: number
) {
  const brushWidth = radius * 2;
  const brushHeight = brushWidth;
  if (!brush) {
    brush = new Uint8ClampedArray(brushWidth * brushHeight * 4);

    for (let y = 0; y < brushHeight; y++) {
      for (let x = 0; x < brushWidth; x++) {
        const rN = (y * brushWidth + x) * 4;
        const gN = rN + 1;
        const bN = rN + 2;
        const aN = rN + 3;

        const dx = x - radius;
        const dy = y - radius;
        const d = Math.sqrt(dy * dy + dx * dx);
        const val = 1 - d / radius;
        brush[rN] = val * 255;
        brush[gN] = val * 255;
        brush[bN] = val * 255;
        brush[aN] = val * 255;
      }
    }
  }

  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const d = Math.sqrt(dy * dy + dx * dx);

  for (let i = 0; i < d; i++) {
    const x = Math.floor(to.x + (i / d) * dx);
    const y = Math.floor(to.y + (i / d) * dy);
    copyBrush(
      pix,
      width,
      height,
      brush,
      brushWidth,
      brushHeight,
      x,
      y,
      color,
      force
    );
  }
}

function copyBrush(
  pix: Uint8ClampedArray,
  width: number,
  height: number,
  brush: Uint8ClampedArray,
  brushWidth: number,
  brushHeight: number,
  x: number,
  y: number,
  color: [number, number, number, number],
  force: number
) {
  const [r, g, b, a] = color;

  for (let bY = 0; bY < brushHeight; bY++) {
    for (let bX = 0; bX < brushWidth; bX++) {
      const aN = (bY * brushWidth + bX) * 4 + 3;

      const orN =
        (width * (y + bY - brushHeight / 2) + x + bX - brushWidth / 2) * 4;
      const ogN = orN + 1;
      const obN = orN + 2;
      const oaN = orN + 3;

      const [oR, oG, oB, oA] = mixv2(
        [pix[orN], pix[ogN], pix[obN], pix[oaN]],
        [r, g, b, a],
        brush[aN] * force * force
      );
      pix[orN] = oR;
      pix[ogN] = oG;
      pix[obN] = oB;
      pix[oaN] = oA;
    }
  }
}

function mixv2(
  a: [number, number, number, number],
  b: [number, number, number, number],
  n: number
): [number, number, number, number] {
  return [mix(a[0], b[0], n), mix(a[1], b[1], n), mix(a[2], b[2], n), 255];
}

function mix(a: number, b: number, n: number) {
  return ((65025 - n * n) / 65025) * a + ((n * n) / 65025) * b;
}

export async function drawCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  from: { x: number; y: number } | null
) {
  const ctx = context;
  ctx.lineWidth = radius * 2;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(from?.x || x, from?.y || y);
  ctx.lineTo(x, y);
  ctx.stroke();
}
