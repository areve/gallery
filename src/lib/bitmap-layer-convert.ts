import type { BitmapLayer, ColorSpace } from "@/interfaces/BitmapLayer";
import { createTiles } from "@/lib/rect";

export function createBitmapLayer(width: number, height: number, space: ColorSpace, tileSize: number = width): BitmapLayer {
  const channels = 4;
  return {
    space,
    channels,
    height,
    width,
    data: new Float32Array(width * height * channels),
    dirty: [],
    tiles: createTiles(width, height, tileSize),
  };
}
