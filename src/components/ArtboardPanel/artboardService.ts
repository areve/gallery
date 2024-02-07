import { ref, watch } from "vue";
import type { Artboard } from "../../interfaces/Artboard";
import type { Rect } from "../../interfaces/Rect";
import { rectsOverlappedByAny } from "@/lib/rect";
import { convertBitmapLayer, createBitmapLayer } from "@/lib/bitmap-layer";
import { resetAll } from "@/lib/bitmap/bitmap-effects";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { artboardState } from "./artboardState";
import ArtboardWorker from "@/workers/artboardWorker?worker";
import type { Brush } from "@/interfaces/Brush";
import type { Coord } from "@/interfaces/Coord";
import type { ColorSpace } from "@/interfaces/BitmapLayer";
import type { ColorCoord } from "@/interfaces/Color";

// TODO why ref?
const artboard = ref<Artboard>({
  // context: undefined!,
  canvas: undefined,
  // bitmapLayer: undefined,
  worker: undefined,
});

// let tempImageData: ImageData | null = null;
// let renderInterval: number | undefined;

// function render() {
//   if (!artboard.value.context) return;
//   if (!artboard.value.bitmapLayer) return;
//   if (!artboard.value.bitmapLayer.dirty.length) return;

//   const dirtyTiles = rectsOverlappedByAny(artboard.value.bitmapLayer.tiles, artboard.value.bitmapLayer.dirty);
//   dirtyTiles.forEach(renderRect);
//   artboard.value.bitmapLayer.dirty = [];
// }

// function renderRect(rect: Rect) {
//   if (!artboard.value.context) return;
//   if (!artboard.value.bitmapLayer) return;

//   if (!tempImageData || tempImageData.width != rect.width || tempImageData.height != rect.height) {
//     tempImageData = new ImageData(rect.width, rect.height);
//   }

//   const context = artboard.value.context;
//   const pixelData = tempImageData.data;
//   const layerData = artboard.value.bitmapLayer.data;
//   const width = artboard.value.bitmapLayer.width;
//   const channels = artboard.value.bitmapLayer.channels;
//   const convert = colorConverter(artboard.value.bitmapLayer.space, "srgb");
//   for (let y = 0; y < rect.height; y++) {
//     for (let x = 0; x < rect.width; x++) {
//       const i = ((y + rect.y) * width + x + rect.x) * channels;
//       const o = (y * rect.width + x) * channels;
//       const rgb = convert([layerData[i + 0], layerData[i + 1], layerData[i + 2]]);
//       pixelData[o + 0] = rgb[0] * 255;
//       pixelData[o + 1] = rgb[1] * 255;
//       pixelData[o + 2] = rgb[2] * 255;
//       pixelData[o + 3] = layerData[i + 3] * 255;
//     }
//   }

//   context.putImageData(tempImageData, rect.x, rect.y);
// }

watch(
  () => artboardState.value.colorSpace,
  () => {
    if (!artboard.value.worker) return;
    artboard.value.worker.postMessage({
      colorSpace: artboardState.value.colorSpace,
    });
    // if (!artboard.value.bitmapLayer) return;
    // const bitmapLayer = convertBitmapLayer(artboard.value.bitmapLayer, artboardState.value.colorSpace);
    // artboard.value.bitmapLayer = bitmapLayer;
  }
);

export function reset() {
  //   if (!artboard.value.context) return;
  //   const context = artboard.value.context;
  //   const height = context.canvas.height;
  //   const width = context.canvas.width;
  //   artboard.value.bitmapLayer = createBitmapLayer(width, height, artboardState.value.colorSpace, 32);
  //   artboard.value.context.clearRect(0, 0, width, height);
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("white"));
  // resetAll(artboard.value.bitmapLayer, color);
  artboard.value.worker?.postMessage({ resetAll: color });
}

export function resetOrange() {
  // if (!artboard.value.bitmapLayer) return;
  // reset();
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("orange"));
  // resetAll(artboard.value.bitmapLayer, color);
  artboard.value.worker?.postMessage({ resetAll: color });
}

export function detachCanvas() {
  // clearInterval(renderInterval);
  // renderInterval = undefined;
  if (artboard.value.worker) {
    artboard.value.worker.terminate();
    artboard.value.worker = undefined;
  }
  artboard.value.canvas = undefined;
}

export function attachToCanvas(canvas: HTMLCanvasElement) {
  detachCanvas();
  artboard.value.worker = new ArtboardWorker();

  artboard.value.canvas = canvas;
  const offscreen = canvas.transferControlToOffscreen();
  artboard.value.worker.postMessage({ canvas: offscreen }, [offscreen]);

  // const context = canvas.getContext("2d", {
  //   willReadFrequently: true,
  // }) as CanvasRenderingContext2D;
  // artboard.value.context = context;
  // renderInterval = setInterval(render, 20);
}

function createColoredBrush(colorSpace: ColorSpace) {
  if (!artboard.value.worker) return;
  artboard.value.worker.postMessage({ action: "createColoredBrush", params: { colorSpace } });
}

function applyBrush(brushLastPoint: Coord, canvasPoint: Coord, weight: number, color: ColorCoord, radius: number) {
  if (!artboard.value.worker) return;
  artboard.value.worker.postMessage({ action: "applyBrush", params: { brushLastPoint, canvasPoint, weight, color, radius } });
}

export default {
  artboard,
  reset,
  createColoredBrush,
  applyBrush,
  resetOrange,
};
