import type { BitmapLayer, ColorSpace } from "@/interfaces/BitmapLayer";
import { createTiles } from "@/lib/rect";
import { colorConverter } from "./color/color";

export function createBitmapLayer(width: number, height: number, space: ColorSpace, tileSize: number = width): BitmapLayer {
  const channels = 4;
  const alphaChannel = 4;
  return {
    space,
    channels,
    alphaChannel,
    height,
    width,
    data: new Float32Array(width * height * channels),
    dirty: [],
    tiles: createTiles(width, height, tileSize),
  };
}

export function convertBitmapLayer(source: BitmapLayer, space: ColorSpace) {
  const width = source.width;
  const height = source.height;
  const dest = createBitmapLayer(width, height, space, source.tiles[0].width);

  const sourceChannels = source.channels;
  const destChannels = dest.channels;
  const last = width * height * sourceChannels;
  const sourceData = source.data;
  const destData = dest.data;

  const colorConvert = colorConverter(source.space, dest.space);
  for (let i = 0; i < last; i += sourceChannels) {
    const sourcePixel = [];
    for (let j = 0; j < sourceChannels; j++) {
      sourcePixel.push(sourceData[i + j]);
    }
    const color = colorConvert(sourcePixel);
    for (let j = 0; j < destChannels; j++) {
      destData[i + j] = color[j];
    }
  }

  dest.dirty.push({
    x: 0,
    y: 0,
    width,
    height,
  });

  return dest;
}
