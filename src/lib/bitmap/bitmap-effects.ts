import type { ColorCoord } from "@/lib/Color";
import type { BitmapLayer } from "../BitmapLayer";
import { colorConverter } from "../color/color";

export function resetAll(bitmapLayer: BitmapLayer, color: ColorCoord) {
  // TODO reset using tiles becaue it's slow
  pixelEffect(bitmapLayer, bitmapLayer.width, bitmapLayer.height, (_) => color);
  bitmapLayer.dirty.push({
    x: 0,
    y: 0,
    width: bitmapLayer.width,
    height: bitmapLayer.height,
  });
}

type ColorTransform = (color: ColorCoord) => ColorCoord;

function pixelEffect(bitmapLayer: BitmapLayer, width: number, height: number, transform: ColorTransform) {
  const channels = bitmapLayer.channels;
  const last = width * height * channels;
  const data = bitmapLayer.data;

  for (let i = 0; i < last; i += channels) {
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
