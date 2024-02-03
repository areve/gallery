// import { clone, rectanglesIntersect } from "@/lib/utils";
// import { cloneContext, createContext, autoCropImage } from "@/lib/canvas/canvas-utils";
// import { ref, watchPostEffect } from "vue";
// import type { Artwork, ArtworkActive } from "@/interfaces/Artwork";
// import { usePersistentState } from "../../services/persistenceService";
// import { loadGalleryItem, saveGalleryItem, updateGalleryItem } from "@/components/Gallery/galleryService";

import { ref } from "vue";
import type { Artboard } from "../../interfaces/Artboard";
import type { Rect } from "../../interfaces/Rect";
import { createOklchBitmapLayer } from "@/lib/bitmap-layer/OklchBitmapLayer";
import { rectsOverlappedByAny } from "@/lib/rect";
import { oklch2srgb } from "@/lib/color/color-oklch";

const artwork = ref<Artboard>({
  //   status: "ready",
  //   name: "",
  //   id: "",
  //   modified: new Date(),
  //   metadata: { history: [] },
  //   frame: { x: 0, y: 0, width: 1024, height: 1024 },
  // bounds: Rect,
  //   context: undefined!,
  //   overlayContext: undefined!,
  bitmapLayer: undefined!,
});

function render() {
  if (!artwork.value.context) return;
  if (!artwork.value.bitmapLayer.dirty.length) return;

  const dirtyTiles = rectsOverlappedByAny(artwork.value.bitmapLayer.tiles, artwork.value.bitmapLayer.dirty);
  dirtyTiles.forEach(renderRect);
  artwork.value.bitmapLayer.dirty = [];
}

function renderRect(rect: Rect) {
  const context = artwork.value.context;
  if (!context) return;

  // TODO some performance gain if we don't keep reading this, it doesn't need to be read
  const imageData = context.getImageData(rect.x, rect.y, rect.width, rect.height);
  const pixelData = imageData.data;
  const layerData = artwork.value.bitmapLayer.data;
  const width = artwork.value.bitmapLayer.width;
  const channels = artwork.value.bitmapLayer.channels;

  //
  // toSrgb: (color: ColorCoord) => ColorCoord;
  // fromSrgb: (color: ColorCoord) => ColorCoord;
  // mix: (color1: ColorAlphaCoord, color2: ColorAlphaCoord) => ColorAlphaCoord;

  // oklch2srgb()
  // srgb2oklch()
  // lerpOklchColor()

  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      const i = ((y + rect.y) * width + x + rect.x) * channels;
      const o = (y * rect.width + x) * channels;
      const rgb = oklch2srgb([layerData[i + 0], layerData[i + 1], layerData[i + 2]]);
      //const rgb = [1, 0.4, 0];
      pixelData[o + 0] = rgb[0] * 255;
      pixelData[o + 1] = rgb[1] * 255;
      pixelData[o + 2] = rgb[2] * 255;
      pixelData[o + 3] = 255; //layerData[i + 3] * 255;
    }
  }

  context.putImageData(imageData, rect.x, rect.y);
}

export function reset() {
  if (!artwork.value.context) return;
  const context = artwork.value.context;

  const height = context.canvas.height;
  const width = context.canvas.width;
  artwork.value.bitmapLayer = createOklchBitmapLayer(width, height, 32);
  artwork.value.context.clearRect(0, 0, width, height);

  // TODO this is not needed in near future
  artwork.value.bitmapLayer.dirty = [{ x: 0, y: 0, height, width }];
}

export default {
  artwork,
  reset,
  render,
};
