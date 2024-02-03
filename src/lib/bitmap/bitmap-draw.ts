import type { BitmapLayer } from "@/interfaces/BitmapLayer";
import type { Rect } from "@/interfaces/Rect";

export function clearCircle(bitmapLayer: BitmapLayer, x: number, y: number, radius: number) {
  const width = bitmapLayer.width;
  const minX = Math.max(0, Math.floor(x - radius));
  const minY = Math.max(0, Math.floor(y - radius));
  const maxX = Math.min(bitmapLayer.width, Math.ceil(x + radius));
  const maxY = Math.min(bitmapLayer.height, Math.ceil(y + radius));
  const data = bitmapLayer.data;
  for (let dataY = minY; dataY < maxY; dataY++) {
    for (let dataX = minX; dataX < maxX; dataX++) {
      const r = Math.sqrt((dataX - x) * (dataX - x) + (dataY - y) * (dataY - y));
      if (r < radius) {
        // TODO in future alpha may not always be 4
        const dataA = (dataY * width + dataX) * 4 + 3;
        data[dataA] = 0;
      }
    }
  }

  const dirtRect: Rect = {
    x: x - radius,
    y: y - radius,
    width: radius * 2,
    height: radius * 2,
  };

  bitmapLayer.dirty.push(dirtRect);
}
