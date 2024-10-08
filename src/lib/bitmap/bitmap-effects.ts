import type { ColorCoord } from "@/lib/Color";
import type { BitmapLayer } from "../BitmapLayer";
import { colorConverter } from "../color/color";
import type { Rect } from "../Rect";

type ColorTransform = (color: ColorCoord) => ColorCoord;

export function colorAll(bitmapLayer: BitmapLayer, color: ColorCoord) {
  // TODO I made it use tiles but it's on the same thread as paint so it does not help rendering too much
  console.log('colorAll')
  bitmapLayer.tiles.forEach((rect: Rect) => {
    pixelEffect(bitmapLayer, rect, (_) => color);
    bitmapLayer.dirty.push(rect);
  });
}

export function loadFromContext(bitmapLayer: BitmapLayer, context: OffscreenCanvasRenderingContext2D) {
  const channels = bitmapLayer.channels;
  const rgbChannels = 4;
  const last = bitmapLayer.width * bitmapLayer.height * channels;
  const data = bitmapLayer.data;
  const sourceData = context.getImageData(0, 0, bitmapLayer.width, bitmapLayer.height).data;

  const convert = colorConverter("srgb", bitmapLayer.space);
  for (let i = 0; i < last; i += rgbChannels) {
    const color = convert([sourceData[i + 0] / 255, sourceData[i + 1] / 255, sourceData[i + 2] / 255, sourceData[i + 3] / 255]);
    for (let j = 0; j < channels; j++) {
      data[i + j] = color[j];
    }
  }

  bitmapLayer.dirty.push({
    x: 0,
    y: 0,
    width: bitmapLayer.width,
    height: bitmapLayer.height,
  });
}

function pixelEffect(bitmapLayer: BitmapLayer, rect: Rect, transform: ColorTransform) {
  const channels = bitmapLayer.channels;
  const width = bitmapLayer.width;
  const data = bitmapLayer.data;

  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      const i = ((y + rect.y) * width + x + rect.x) * channels;

      const source = [];
      for (let j = 0; j < channels; j++) {
        source.push(data[i + j]);
      }
      const color = transform(source);
      for (let j = 0; j < channels; j++) {
        data[i + j] = color[j];
      }
    }
  }
}
