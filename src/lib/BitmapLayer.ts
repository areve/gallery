import { createTiles, rectsOverlappedByAny } from "@/lib/rect";
import { colorConverter } from "./color/color";
import type { Rect } from "@/interfaces/Rect";

export type ColorSpace = "oklch" | "srgb";

export interface BitmapLayer {
  data: Float32Array;
  width: number;
  height: number;
  channels: number;
  alphaChannel: number;
  space: ColorSpace;
  dirty: Rect[];
  tiles: Rect[];
}

export interface OklchBitmapLayer extends BitmapLayer {
  space: "oklch";
}
export interface SrgbBitmapLayer extends BitmapLayer {
  space: "srgb";
}

let tempImageData: ImageData | null = null;

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

export function renderBitmapLayer(bitmapLayer: BitmapLayer, context: OffscreenCanvasRenderingContext2D) {
  const dirtyTiles = rectsOverlappedByAny(bitmapLayer.tiles, bitmapLayer.dirty);
  dirtyTiles.forEach((rect: Rect) => renderRect(bitmapLayer, context, rect));
  bitmapLayer.dirty = [];
}

export function renderRect(bitmapLayer: BitmapLayer, context: OffscreenCanvasRenderingContext2D, rect: Rect) {
  if (!context) return;
  if (!bitmapLayer) return;

  if (!tempImageData || tempImageData.width != rect.width || tempImageData.height != rect.height) {
    tempImageData = new ImageData(rect.width, rect.height);
  }

  const pixelData = tempImageData.data;
  const layerData = bitmapLayer.data;
  const width = bitmapLayer.width;
  const channels = bitmapLayer.channels;
  const convert = colorConverter(bitmapLayer.space, "srgb");
  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      const i = ((y + rect.y) * width + x + rect.x) * channels;
      const o = (y * rect.width + x) * channels;
      const rgb = convert([layerData[i + 0], layerData[i + 1], layerData[i + 2]]);
      pixelData[o + 0] = rgb[0] * 255;
      pixelData[o + 1] = rgb[1] * 255;
      pixelData[o + 2] = rgb[2] * 255;
      pixelData[o + 3] = layerData[i + 3] * 255;
    }
  }

  context.putImageData(tempImageData, rect.x, rect.y);
}
