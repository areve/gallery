import type { RgbaLayer } from "@/interfaces/RgbaLayer";

export function clearCircle(
  rgbaLayer: RgbaLayer,
  x: number,
  y: number,
  radius: number
) {
  const width = rgbaLayer.width;
  const minX = Math.floor(x - radius);
  const minY = Math.floor(y - radius);
  const maxX = Math.ceil(x + radius);
  const maxY = Math.ceil(y + radius);
  const data = rgbaLayer.data;
  for (let dataY = minY; dataY < maxY; dataY++) {
    for (let dataX = minX; dataX < maxX; dataX++) {
      const r = Math.sqrt(
        (dataX - x) * (dataX - x) + (dataY - y) * (dataY - y)
      );
      if (r < radius) {
        const dataA = (dataY * width + dataX) * 4 + 3;
        data[dataA] = 0;
      }
    }
  }

  rgbaLayer.modified = new Date();
}
