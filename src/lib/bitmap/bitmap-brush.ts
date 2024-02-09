import type { BitmapLayer, ColorSpace } from "@/interfaces/BitmapLayer";
import type { Brush } from "@/interfaces/Brush";
import type { Coord } from "@/interfaces/Coord";
import type { ColorCoord } from "@/interfaces/Color";
import { createBitmapLayer } from "@/lib/bitmap-layer";
import { colorMixer } from "@/lib/color/color";

export function createBrush(radius: number, color: ColorCoord, space: ColorSpace) {
  const width = radius * 2;
  const height = width;

  const brush = createBitmapLayer(width, height, space) as Brush;

  const data = brush.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dataR = (y * width + x) * 4;
      const [dataG, dataB, dataA] = [dataR + 1, dataR + 2, dataR + 3];
      const dx = x - radius;
      const dy = y - radius;
      const d = Math.sqrt(dy * dy + dx * dx);
      const value = Math.max(0, 1 - d / radius);
      data[dataR] = color[0];
      data[dataG] = color[1];
      data[dataB] = color[2];
      data[dataA] = value * color[3];
    }
  }

  return brush;
}

export async function applyBrush(bitmapLayer: BitmapLayer, from: Coord | null, to: Coord, brush: Brush, weight: number) {
  if (from) {
    brushLine(bitmapLayer, from!, to, brush, weight);
  } else {
    brushPoint(bitmapLayer, to, brush, weight);
  }
}

function brushLine(bitmapLayer: BitmapLayer, from: Coord, to: Coord, brush: Brush, weight: number) {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const d = Math.sqrt(dy * dy + dx * dx);

  // TODO need to know speed as well as weight to calculate this better
  const brushRadius = Math.min(brush.width, brush.height) / 2;

  for (let i = 0; i < d; i += brushRadius) {
    const x = Math.floor(to.x + (i / d) * dx);
    const y = Math.floor(to.y + (i / d) * dy);
    brushPoint(bitmapLayer, { x, y }, brush, weight);
  }
}

function brushPoint(bitmapLayer: BitmapLayer, to: Coord, brush: Brush, weight: number) {
  const brushHeight = brush.height;
  const brushWidth = brush.width;
  const brushData = brush.data;
  const width = bitmapLayer.width;
  const data = bitmapLayer.data;
  const mix = colorMixer(bitmapLayer.space);

  const x = Math.floor(to.x);
  const y = Math.floor(to.y);

  for (let bY = 0; bY < brushHeight; bY++) {
    for (let bX = 0; bX < brushWidth; bX++) {
      const pixelY = y + bY - brushHeight / 2;
      const pixelX = x + bX - brushWidth / 2;

      if (pixelY >= 0 && pixelY <= bitmapLayer.height && pixelX >= 0 && pixelX <= width) {
        const dataR = (width * pixelY + pixelX) * 4;
        const [dataG, dataB, dataA] = [dataR + 1, dataR + 2, dataR + 3];

        const brushR = (bY * brushWidth + bX) * 4;
        const [brushG, brushB, brushA] = [brushR + 1, brushR + 2, brushR + 3];
        const color = mix(
          [data[dataR], data[dataG], data[dataB], data[dataA]],
          [brushData[brushR], brushData[brushG], brushData[brushB], brushData[brushA] * weight]
        );

        data[dataR] = color[0];
        data[dataG] = color[1];
        data[dataB] = color[2];
        data[dataA] = color[3];
      }
    }
  }
  bitmapLayer.dirty.push({
    x: to.x - brush.width / 2,
    y: to.y - brush.height / 2,
    width: brush.width,
    height: brush.height,
  });
}
