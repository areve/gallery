import type { RgbaLayer } from "@/interfaces/RgbaLayer";
import { rgb2ryb, ryb2rgb } from "../color/color-ryb";

export function rgb2rybEffect(rgbaLayer: RgbaLayer) {
  pixelEffect(rgbaLayer.data, rgbaLayer.width, rgbaLayer.height, rgb2ryb);
  rgbaLayer.modified = new Date();
}

export function ryb2rgbEffect(rgbaLayer: RgbaLayer) {
  pixelEffect(rgbaLayer.data, rgbaLayer.width, rgbaLayer.height, ryb2rgb);
  rgbaLayer.modified = new Date();
}

export function pixelEffect(
  data: Float32Array,
  width: number,
  height: number,
  func: (rgb: [number, number, number]) => [number, number, number]
) {
  const last = width * height * 4;
  for (let i = 0; i < last; i += 4) {
    const [r, g, b] = func([data[i], data[i + 1], data[i + 2]]);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
}
