import { ref, watchPostEffect } from "vue";
import type { Artboard } from "../../interfaces/Artboard";
import type { Rect } from "../../interfaces/Rect";
import { rectsOverlappedByAny } from "@/lib/rect";
import { oklch2srgb, srgb2oklch } from "@/lib/color/color-oklch";
import { createBitmapLayer } from "@/lib/bitmap-layer";
import { resetAll } from "@/lib/bitmap/bitmap-effects";
import { color2srgb, convertColor } from "@/lib/color/color";
import { artboardState } from "./artboardState";

const artboard = ref<Artboard>({
  context: undefined!,
  bitmapLayer: undefined!,
});

let tempImageData: ImageData | null = null;

function render() {
  if (!artboard.value.context) return;
  if (!artboard.value.bitmapLayer.dirty.length) return;

  const dirtyTiles = rectsOverlappedByAny(artboard.value.bitmapLayer.tiles, artboard.value.bitmapLayer.dirty);
  dirtyTiles.forEach(renderRect);
  artboard.value.bitmapLayer.dirty = [];
}

function renderRect(rect: Rect) {
  const context = artboard.value.context;
  if (!context) return;

  if (!tempImageData || tempImageData.width != rect.width || tempImageData.height != rect.height) {
    tempImageData = new ImageData(rect.width, rect.height);
  }

  const pixelData = tempImageData.data;
  const layerData = artboard.value.bitmapLayer.data;
  const width = artboard.value.bitmapLayer.width;
  const channels = artboard.value.bitmapLayer.channels;

  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      const i = ((y + rect.y) * width + x + rect.x) * channels;
      const o = (y * rect.width + x) * channels;
      // TODO a better way to get the method is needed
      const rgb = convertColor(artboard.value.bitmapLayer.space, "srgb", [layerData[i + 0], layerData[i + 1], layerData[i + 2]]);
      pixelData[o + 0] = rgb[0] * 255;
      pixelData[o + 1] = rgb[1] * 255;
      pixelData[o + 2] = rgb[2] * 255;
      pixelData[o + 3] = layerData[i + 3] * 255;
    }
  }

  context.putImageData(tempImageData, rect.x, rect.y);
}

watchPostEffect(() => {
  console.log(artboardState.value.colorSpace);
  //reset()
  if (!artboard.value.context) return;
  const context = artboard.value.context;
  const height = context.canvas.height;
  const width = context.canvas.width;
  artboard.value.bitmapLayer = createBitmapLayer(width, height, artboardState.value.colorSpace, 32);
});

export function reset() {
  if (!artboard.value.context) return;
  const context = artboard.value.context;

  const height = context.canvas.height;
  const width = context.canvas.width;
  artboard.value.bitmapLayer = createBitmapLayer(width, height, artboardState.value.colorSpace, 32);
  artboard.value.context.clearRect(0, 0, width, height);

  const color = srgb2oklch(color2srgb("white"));
  resetAll(artboard.value.bitmapLayer, color);
}

export function resetOrange() {
  if (!artboard.value.context) return;
  const context = artboard.value.context;

  const height = context.canvas.height;
  const width = context.canvas.width;
  artboard.value.bitmapLayer = createBitmapLayer(width, height, artboardState.value.colorSpace, 32);
  artboard.value.context.clearRect(0, 0, width, height);

  const color = srgb2oklch(color2srgb("orange"));
  resetAll(artboard.value.bitmapLayer, color);
}

export default {
  artboard,
  reset,
  resetOrange,
  render,
};
