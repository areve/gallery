import { cloneContext } from "./canvas";
import Color from "color";
import type { ArtworkOnCanvas } from "@/interfaces/Artwork";
import type { Brush } from "@/interfaces/Brush";

export function makeBrush(radius: number) {
  const width = radius * 2;
  const height = width;
  const channels = 4

  const rgbaData = new Float32Array(width * height * channels)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rN = (y * width + x) * 4;
      const gN = rN + 1;
      const bN = rN + 2;
      const aN = rN + 3;

      const dx = x - radius;
      const dy = y - radius;
      const d = Math.sqrt(dy * dy + dx * dx);
      const val = 1 - d / radius;
      rgbaData[rN] = 1;
      rgbaData[gN] = 1;
      rgbaData[bN] = 1;
      rgbaData[aN] = val;
    }
  }

  return <Brush>{
    rgbaData,
    width,
    height
  }
}

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
  artwork: ArtworkOnCanvas,
  x: number,
  y: number,
  brush: Brush,
  color: string,
  from: { x: number; y: number } | null,
  weight: number
) {
  if (!from) return;

  const w = artwork.context.canvas.width;
  const h = artwork.context.canvas.height;
  // const imageData = artwork.context.getImageData(0, 0, w, h);
  // const pix = imageData.data;

  const c = Color(color);
  const { r, g, b, a } = c.object();
  const col = [r, g, b, a === undefined ? 1 : a] as [number, number, number, number];

  brushLine1(artwork.rgbaData, w, h, from, { x, y }, brush, col, weight);
  // artwork.context.putImageData(imageData, 0, 0);
}

interface Coord {
  x: number;
  y: number;
}

function brushLine1(
  pix: Float32Array,
  width: number,
  height: number,
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
    applyBrush(
      pix,
      width,
      height,
      brush,
      x,
      y,
      color,
      weight
    );
  }
}

function applyBrush(
  pix: Float32Array,
  width: number,
  height: number,
  brush: Brush,
  x: number,
  y: number,
  color: [number, number, number, number],
  weight: number
) {
  const brushHeight = brush.height
  const brushWidth = brush.width
  const rgbaData = brush.rgbaData
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
        rgbaData[aN] * color[3] * weight //weight squared, why here?

      ]

      const [oR, oG, oB, oA] = pixelMix(
        [pix[orN], pix[ogN], pix[obN], pix[oaN]],
        brushPixel
      );

      pix[orN] = oR;
      pix[ogN] = oG;
      pix[obN] = oB;
      pix[oaN] = oA;
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
    pixel[3] + color[3]
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
    pixel[3] + color[3]
  ];
}

function pixelMix(
  pixel: [number, number, number, number],
  color: [number, number, number, number]
): [number, number, number, number] {
  // return [1, 1, 1, 1]
  const weight = (color[3])
  return [
    ((1 - weight) * pixel[0] + weight * color[0]),
    ((1 - weight) * pixel[1] + weight * color[1]),
    ((1 - weight) * pixel[2] + weight * color[2]),
    pixel[3] + color[3]
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
