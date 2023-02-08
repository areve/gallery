import type { RgbaLayer } from "@/interfaces/RgbaLayer";
import { rgb2ryb, ryb2rgb } from "../color/color-ryb";

export function rgb2rybEffect(rgbaLayer: RgbaLayer) {
  const data = rgbaLayer.data;

  const last = rgbaLayer.width * rgbaLayer.height * 4;
  for (let i = 0; i < last; i += 4) {
    const [r, g, b] = rgb2ryb([data[i], data[i + 1], data[i + 2]]);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }

  rgbaLayer.modified = new Date()
}

export function rgb2rgbEffect(rgbaLayer: RgbaLayer) {
  const data = rgbaLayer.data;

  const last = rgbaLayer.width * rgbaLayer.height * 4;
  for (let i = 0; i < last; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  rgbaLayer.modified = new Date()
}

export function ryb2rgbEffect(rgbaLayer: RgbaLayer) {
  const data = rgbaLayer.data;

  const last = rgbaLayer.width * rgbaLayer.height * 4;
  for (let i = 0; i < last; i += 4) {
    const [r, g, b] = ryb2rgb([data[i], data[i + 1], data[i + 2]]);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }

  rgbaLayer.modified = new Date()
}
