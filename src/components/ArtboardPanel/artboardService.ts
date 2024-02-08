import { ref, watchPostEffect } from "vue";
import type { Artboard } from "../../interfaces/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { artboardState } from "./artboardState";
import artboardWorker from "@/workers/artboardWorker?worker";
import type { Coord } from "@/interfaces/Coord";
import type { ColorCoord } from "@/interfaces/Color";
import type { ActionName, ActionSpec, ActionSpecParams, ActionsSpec, ArtboardWorker, ArtboardWorkerMessage2 } from "@/workers/ArtboardWorkerInterfaces";

// TODO should this know about brushes? or just have the worker
// TODO why ref?
const artboard = ref<Artboard>({
  canvas: undefined,
  worker: undefined, // TODO keep this private?
});

// export function dispatch<T1, T2>(action: T1, params: T2) {
//   if (!artboard.value.worker) return false;
//   // artboard.value.worker.dispatch(...para)
//   artboard.value.worker.postMessage({
//     action,
//     params,
//   });
//   return true;
// }

export function dispatch(actionSpec: ActionsSpec) {
  if (!artboard.value.worker) return false;
  artboard.value.worker.postMessage(actionSpec);
  return true;
}

watchPostEffect(() => {
  if (!artboard.value.worker) return;
  artboard.value.worker.postMessage({
    action: "setColorSpace",
    params: {
      colorSpace: artboardState.value.colorSpace,
    },
  });
});

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
  artboard.value.worker.onmessage = (event: MessageEvent<ArtboardWorkerMessage2>) => {
    if (event.data.action === "fps") {
      artboardState.value.fps = event.data.params.fps;
    }
  };
  artboard.value.canvas = canvas;
  const offscreenCanvas = canvas.transferControlToOffscreen();
  artboard.value.worker.postMessage(
    {
      action: "initialize",
      params: { offscreenCanvas },
    },
    [offscreenCanvas] as StructuredSerializeOptions
  );
}

// function setBrush(color: string, radius: number) {
//   if (!artboard.value.worker) return;
//   artboard.value.worker.postMessage({
//     action: "setBrush",
//     params: {
//       color,
//       radius,
//     },
//   });
// }

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

function clearCircle(coord: Coord, radius: number) {
  if (!artboard.value.worker) return;
  artboard.value.worker.postMessage({
    action: "clearCircle",
    params: {
      coord,
      radius,
    },
  });
}
export default {
  artboard,
  reset,
  // setBrush,
  clearCircle,
  applyBrush,
  resetOrange,
};
