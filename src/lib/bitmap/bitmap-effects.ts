import type { ColorCoord } from "@/interfaces/Color";
import type { BitmapLayer } from "../BitmapLayer";

export function resetAll(bitmapLayer: BitmapLayer, color: ColorCoord) {
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
