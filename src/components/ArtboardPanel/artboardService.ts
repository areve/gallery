import { ref, watch } from "vue";
import type { Artboard } from "../../interfaces/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { artboardState } from "./artboardState";
import artboardWorker from "@/workers/artboardWorker?worker";
import type { Coord } from "@/interfaces/Coord";
import type { ColorSpace } from "@/interfaces/BitmapLayer";
import type { ColorCoord } from "@/interfaces/Color";
import type { ArtboardWorker } from "@/workers/ArtboardWorkerInterfaces";

// ArtboardWorkerType
// TODO why ref?
const artboard = ref<Artboard>({
  // context: undefined!,
  canvas: undefined,
  // bitmapLayer: undefined,
  worker: undefined, // TODO keep this private?
});

watch(
  () => artboardState.value.colorSpace,
  () => {
    if (!artboard.value.worker) return;
    artboard.value.worker.postMessage({
      action: "setColorSpace",
      params: {
        colorSpace: artboardState.value.colorSpace,
      },
    });
    // const bitmapLayer = convertBitmapLayer(artboard.value.bitmapLayer, artboardState.value.colorSpace);
    // artboard.value.bitmapLayer = bitmapLayer;
  }
);

export function reset() {
  if (!artboard.value.worker) return;
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("white"));
  artboard.value.worker.postMessage({ action: "reset", params: { color } });
}

export function resetOrange() {
  if (!artboard.value.worker) return;
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("orange"));
  artboard.value.worker.postMessage({ action: "reset", params: { color } });
}

export function detachCanvas() {
  artboard.value.worker?.terminate();
  artboard.value.worker = undefined;
  artboard.value.canvas = undefined;
}

export function attachToCanvas(canvas: HTMLCanvasElement) {
  detachCanvas();
  artboard.value.worker = new artboardWorker() as ArtboardWorker;
  artboard.value.canvas = canvas;
  const offscreenCanvas = canvas.transferControlToOffscreen();
  artboard.value.worker.postMessage(
    {
      action: "initialize",
      params: { offscreenCanvas },
    },
    [offscreenCanvas]
  );
}

function createColoredBrush(colorSpace: ColorSpace) {
  if (!artboard.value.worker) return;
  // artboard.value.worker.postMessage({ action: "createColoredBrush", params: { colorSpace } });
}

function applyBrush(brushLastPoint: Coord, canvasPoint: Coord, weight: number, color: ColorCoord, radius: number) {
  if (!artboard.value.worker) return;
  artboard.value.worker.postMessage({
    action: "applyBrush",
    params: {
      fromPoint: brushLastPoint,
      toPoint: canvasPoint,
      weight,
      color,
      radius,
    },
  });
}

export default {
  artboard,
  reset,
  createColoredBrush,
  applyBrush,
  resetOrange,
};
