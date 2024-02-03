import type { RgbaLayer } from "@/interfaces/RgbaLayer";
import { clearCircle } from "./rgba-draw";

export function shotgunEffect(rgbaLayer: RgbaLayer) {
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * rgbaLayer.width;
    const y = Math.random() * rgbaLayer.height;

    clearCircle(rgbaLayer, x, y, 8);
  }
}
