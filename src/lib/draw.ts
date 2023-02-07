import Color from "color";
import type { Brush } from "@/interfaces/Brush";
import type { RgbaLayer } from "@/interfaces/RgbaLayer";

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

export async function drawPencil(
  rgbaLayer: RgbaLayer,
  x: number,
  y: number,
  brush: Brush,
  color: string,
  from: { x: number; y: number } | null,
  weight: number
) {
  if (!from) return;

  const c = Color(color);
  const { r, g, b, a } = c.object();
  const col = [r / 255, g / 255, b / 255, a === undefined ? 1 : a / 255] as [
    number,
    number,
    number,
    number
  ];

  brushLine1(rgbaLayer, from, { x, y }, brush, col, weight);
  rgbaLayer.modified = new Date();
}

interface Coord {
  x: number;
  y: number;
}

function brushLine1(
  rgbaLayer: RgbaLayer,
  from: Coord,
  to: Coord,
  brush: Brush,
  color: [number, number, number, number],
  weight: number
) {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const d = Math.sqrt(dy * dy + dx * dx);

  for (let i = 0; i < d; i++) {
    const x = Math.floor(to.x + (i / d) * dx);
    const y = Math.floor(to.y + (i / d) * dy);
    applyBrush(rgbaLayer, brush, x, y, color, weight);
  }
}

function applyBrush(
  rgbaLayer: RgbaLayer,
  brush: Brush,
  x: number,
  y: number,
  color: [number, number, number, number],
  weight: number
) {
  const brushHeight = brush.height;
  const brushWidth = brush.width;
  const rgbaData = brush.data;
  const width = rgbaLayer.width;
  const data = rgbaLayer.data;
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

      const brushPixel: [number, number, number, number] = [
        rgbaData[rN] * color[0],
        rgbaData[gN] * color[1],
        rgbaData[bN] * color[2],
        rgbaData[aN] * color[3] * weight, //weight squared, why here?
      ];

      const [oR, oG, oB, oA] = pixelMix(
        [data[orN], data[ogN], data[obN], data[oaN]],
        brushPixel
      );

      data[orN] = oR;
      data[ogN] = oG;
      data[obN] = oB;
      data[oaN] = oA;
    }
  }
}

function pixelAdd(
  pixel: [number, number, number, number],
  color: [number, number, number, number]
): [number, number, number, number] {
  return [
    pixel[0] + (color[3] / 255) * color[0],
    pixel[1] + (color[3] / 255) * color[1],
    pixel[2] + (color[3] / 255) * color[2],
    pixel[3] + color[3],
  ];
}

function pixelSub(
  pixel: [number, number, number, number],
  color: [number, number, number, number]
): [number, number, number, number] {
  return [
    pixel[0] - (color[3] / 255) * color[0],
    pixel[1] - (color[3] / 255) * color[1],
    pixel[2] - (color[3] / 255) * color[2],
    pixel[3] + color[3],
  ];
}

function pixelMix(
  pixel: [number, number, number, number],
  color: [number, number, number, number]
): [number, number, number, number] {
  const weight = color[3];
  return [
    (1 - weight) * pixel[0] + weight * color[0],
    (1 - weight) * pixel[1] + weight * color[1],
    (1 - weight) * pixel[2] + weight * color[2],
    pixel[3] + color[3],
  ];
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
