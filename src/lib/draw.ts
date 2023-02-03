import { cloneContext } from "./canvas";
import Color from "color";
import { rgb2rgbEffect, rgb2rybEffect, ryb2rgbEffect } from "./effects-ryb2rgb";
import {
  rgb2ryb,
  rgb2ryb_found,
  ryb2rgb,
  ryb2rgb_found,
} from "./color-convert";

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

  // rgb2rybEffect(context)

  const w = context.canvas.width;
  const h = context.canvas.height;
  const imageData = context.getImageData(0, 0, w, h);
  const pix = imageData.data;

  // TODO to paint on RYB a permanent hidden RYB layer is needed, it's too slow to convert every time, and its weird anyway
  // (function () {
  //   const last = w * h * 4
  //   for (let i = 0; i < last; i += 4) {
  //     const [r, g, b] = rgb2ryb([pix[i], pix[i + 1], pix[i + 2]])
  //     pix[i] = r
  //     pix[i + 1] = g
  //     pix[i + 2] = b
  //     pix[i + 3] = 255
  //   }
  // })();

  const c = Color(color);
  const { r, g, b, a } = c.object();

  // const col = rgb2ryb([r, g, b]) as [number, number, number]
  const col = [r, g, b] as [number, number, number];

  brushLine1(pix, w, h, from, { x, y }, radius, col, force);
  // sprayLine1(pix, w, h, from, { x, y }, radius, color)

  // (function () {
  //   const last = w * h * 4
  //   for (let i = 0; i < last; i += 4) {
  //     const [r, g, b] = ryb2rgb([pix[i], pix[i + 1], pix[i + 2]])
  //     pix[i] = r
  //     pix[i + 1] = g
  //     pix[i + 2] = b
  //     pix[i + 3] = 255
  //   }
  // })();

  context.putImageData(imageData, 0, 0);
  // ryb2rgbEffect(context)
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
  color: [number, number, number],
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
  color: [number, number, number],
  force: number
) {
  // let [r, g, b] = rgb2ryb_found([r1, g1, b1])
  const [r, g, b] = color;

  for (let bY = 0; bY < brushHeight; bY++) {
    for (let bX = 0; bX < brushWidth; bX++) {
      const rN = (bY * brushWidth + bX) * 4;
      const gN = rN + 1;
      const bN = rN + 2;
      const aN = rN + 3;

      const orN =
        (width * (y + bY - brushHeight / 2) + x + bX - brushWidth / 2) * 4;
      const ogN = orN + 1;
      const obN = orN + 2;
      const oaN = orN + 3;

      const [oR, oG, oB] = mixv2(
        [pix[orN], pix[ogN], pix[obN]],
        [r, g, b],
        brush[aN] * force * force
      );
      pix[orN] = oR;
      pix[ogN] = oG;
      pix[obN] = oB;
      pix[oaN] = 255;
    }
  }
}

function mix(a: number, b: number, n: number) {
  return ((65025 - n * n) / 65025) * a + ((n * n) / 65025) * b;
}

function hMix(a: number, b: number, n: number) {
  return (((65025 - n * n) / 65025) * a + ((n * n) / 65025) * b + 360) % 360;
}
function pMix(a: number, b: number, n: number) {
  return ((65025 - n * n) / 65025) * a + ((n * n) / 65025) * b;
}

// I fouund a web script that was a little slow and only helped blue mix yellow to green a bit, a bit weird
// function mixv2(a: [number, number, number], b: [number, number, number], n: number) {
//   const aRyb = rgb2ryb(a)
//   const bRyb = rgb2ryb(b)
//   return ryb2rgb([
//     mix(aRyb[0], bRyb[0], n),
//     mix(aRyb[1], bRyb[1], n),
//     mix(aRyb[2], bRyb[2], n),
//   ])
// }
// was really slow helped mix a bit yellow to green

function mixv2(
  a: [number, number, number],
  b: [number, number, number],
  n: number
) {
  return [mix(a[0], b[0], n), mix(a[1], b[1], n), mix(a[2], b[2], n)];
}

function sprayLine1(
  pix: Uint8ClampedArray,
  width: number,
  height: number,
  from: Coord,
  to: Coord,
  radius: number,
  color: string
) {
  const c = Color(color);
  const { r, g, b, a } = c.object();
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.sqrt(dy * dy + dx * dx);
  const step = radius / d;
  for (let n = 0; n <= 1; n += step) {
    drawPencilDot(pix, width, to.x - dx * n, to.y - dy * n, radius, r, g, b);
  }
}

export async function drawPencilDot(
  pix: Uint8ClampedArray,
  w: number,
  x: number,
  y: number,
  radius: number,
  r: number,
  g: number,
  b: number
) {
  x = ~~x;
  y = ~~y;

  for (let y1 = y - radius; y1 < y + radius; y1++) {
    for (let x1 = x - radius; x1 < x + radius; x1++) {
      const dx = x1 - x;
      const dy = y1 - y;
      const d = Math.max(radius - Math.sqrt(dy * dy + dx * dx), 0) / radius;

      const rN = (y1 * w + x1) * 4 + 0;
      const gN = (y1 * w + x1) * 4 + 1;
      const bN = (y1 * w + x1) * 4 + 2;
      const aN = (y1 * w + x1) * 4 + 3;
      const r0 = pix[rN];
      const g0 = pix[gN];
      const b0 = pix[bN];
      const weight = 0.4 * d;
      const invWeight = 1 - weight;
      const r1 = r0 * invWeight + r * weight;
      const g1 = g0 * invWeight + g * weight;
      const b1 = b0 * invWeight + b * weight;
      pix[rN] = r1;
      pix[gN] = g1;
      pix[bN] = b1;
      pix[aN] = 255;
    }
  }
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
