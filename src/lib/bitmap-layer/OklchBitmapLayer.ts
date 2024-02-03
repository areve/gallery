import { lerpOklchColor, oklch2srgb, srgb2oklch } from "@/lib/color/color-oklch";
// import {
//   lerpOklchColor as lerpOklchColor_wasm,
//   oklch2srgb as oklch2srgb_wasm,
//   srgb2oklch as srgb2oklch_wasm,
// } from "../../../build/release.js";

import type { OklchBitmapLayer } from "@/interfaces/BitmapLayer";
import { createTiles } from "@/lib/rect";

export function createOklchBitmapLayer(width: number, height: number, tile: number = width): OklchBitmapLayer {
  const channels = 4;
  return {
    space: "oklch",
    channels,
    height,
    width,
    data: new Float32Array(width * height * channels),
    dirty: [],
    tiles: createTiles(width, height, tile),
    // toSrgb: oklch2srgb,
    // fromSrgb: srgb2oklch,
    // mix: lerpOklchColor,
  };
}
