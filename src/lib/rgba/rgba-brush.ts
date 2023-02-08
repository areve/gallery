import type { Brush } from "@/interfaces/Brush";
import type { RgbaColor, RgbaLayer } from "@/interfaces/RgbaLayer";
import type { Coord } from "@/interfaces/Coord";

export function makeBrush(radius: number) {
  const width = radius * 2;
  const height = width;
  const channels = 4;

  const data = new Float32Array(width * height * channels);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dataR = (y * width + x) * 4;
      const [dataG, dataB, dataA] = [dataR + 1, dataR + 2, dataR + 3];
      const dx = x - radius;
      const dy = y - radius;
      const d = Math.sqrt(dy * dy + dx * dx);
      const value = Math.max(0, 1 - d / radius);
      data[dataR] = 1;
      data[dataG] = 1;
      data[dataB] = 1;
      data[dataA] = value;
    }
  }

  return <Brush>{
    data,
    width,
    height,
  };
}

export async function brushApply(
  rgbaLayer: RgbaLayer,
  from: Coord | null,
  to: Coord,
  brush: Brush,
  color: RgbaColor,
  weight: number
) {
  if (from) {
    brushLine(rgbaLayer, from, to, brush, color, weight);
  } else {
    brushPoint(rgbaLayer, to, brush, color, weight);
  }
}

function brushLine(
  rgbaLayer: RgbaLayer,
  from: Coord,
  to: Coord,
  brush: Brush,
  color: RgbaColor,
  weight: number
) {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const d = Math.sqrt(dy * dy + dx * dx);

  for (let i = 0; i < d; i++) {
    const x = Math.floor(to.x + (i / d) * dx);
    const y = Math.floor(to.y + (i / d) * dy);
    brushPoint(rgbaLayer, { x, y }, brush, color, weight);
  }

  rgbaLayer.modified = new Date();
}

function brushPoint(
  rgbaLayer: RgbaLayer,
  to: Coord,
  brush: Brush,
  color: RgbaColor,
  weight: number
) {
  const brushHeight = brush.height;
  const brushWidth = brush.width;
  const brushData = brush.data;
  const width = rgbaLayer.width;
  const data = rgbaLayer.data;
  const { x, y } = to;
  for (let bY = 0; bY < brushHeight; bY++) {
    for (let bX = 0; bX < brushWidth; bX++) {
      const brushR = (bY * brushWidth + bX) * 4;
      const [brushG, brushB, brushA] = [brushR + 1, brushR + 2, brushR + 3];

      const dataR =
        (width * (y + bY - brushHeight / 2) + x + bX - brushWidth / 2) * 4;
      const [dataG, dataB, dataA] = [dataR + 1, dataR + 2, dataR + 3];

      const [r, g, b, a] = pixelMix(
        [data[dataR], data[dataG], data[dataB], data[dataA]],
        [
          brushData[brushR] * color[0],
          brushData[brushG] * color[1],
          brushData[brushB] * color[2],
          brushData[brushA] * color[3] * weight,
        ]
      );

      data[dataR] = r;
      data[dataG] = g;
      data[dataB] = b;
      data[dataA] = a;
    }
  }
}

// function pixelAdd(
//   pixel: RgbaColor,
//   color: RgbaColor
// ): RgbaColor {
//   return [
//     pixel[0] + (color[3] / 255) * color[0],
//     pixel[1] + (color[3] / 255) * color[1],
//     pixel[2] + (color[3] / 255) * color[2],
//     pixel[3] + color[3],
//   ];
// }

// function pixelSub(
//   pixel: RgbaColor,
//   color: RgbaColor
// ): RgbaColor {
//   return [
//     pixel[0] - (color[3] / 255) * color[0],
//     pixel[1] - (color[3] / 255) * color[1],
//     pixel[2] - (color[3] / 255) * color[2],
//     pixel[3] + color[3],
//   ];
// }

function pixelMix(pixel: RgbaColor, color: RgbaColor): RgbaColor {
  if (pixel[3] === 0) return color;
  const weight = color[3];
  return [
    (1 - weight) * pixel[0] + weight * color[0],
    (1 - weight) * pixel[1] + weight * color[1],
    (1 - weight) * pixel[2] + weight * color[2],
    Math.min(pixel[3] + color[3], 1),
  ];
}
