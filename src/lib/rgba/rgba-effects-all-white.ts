import type { RgbaLayer } from "@/interfaces/RgbaLayer";
import { pixelEffect } from "./rgba-effects-ryb2rgb";

// TODO lets have a reset colour setting instead of this
export function allWhiteEffect(rgbaLayer: RgbaLayer) {
  pixelEffect(rgbaLayer.data, rgbaLayer.width, rgbaLayer.height, (_) => [
    1, 1, 1,
  ]);
  rgbaLayer.modified = new Date();
}
