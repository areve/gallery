import { ref, watchPostEffect } from "vue";
import type { Artboard } from "../../interfaces/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { artboardState } from "./artboardState";
import artboardWorker from "@/workers/artboardWorker?worker";
import type { Coord } from "@/interfaces/Coord";
import type { ColorCoord } from "@/interfaces/Color";
import type { ActionSpec, ArtboardWorker } from "@/workers/ArtboardWorkerInterfaces";

// TODO should this know about brushes? or just have the worker
// TODO why ref?
const artboard = ref<Artboard>({
  canvas: undefined,
  worker: undefined, // TODO keep this private?
});

export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  if (!artboard.value.worker) return false;
  artboard.value.worker.postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}

watchPostEffect(() => {
  if (!artboard.value.worker) return;
  dispatch({
    name: "setColorSpace",
    params: [artboardState.value.colorSpace],
  });
});

export function reset() {
  if (!artboard.value.worker) return;
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("white"));
  dispatch({
    name: "reset",
    params: [color],
  });
}

export function resetOrange() {
  if (!artboard.value.worker) return;
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("orange"));
  dispatch({
    name: "reset",
    params: [color],
  });
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
  dispatch(
    {
      name: "initialize",
      params: [offscreenCanvas],
    },
    [offscreenCanvas]
  );
}

function applyBrush(brushLastPoint: Coord, canvasPoint: Coord, weight: number, color: ColorCoord, radius: number) {
  if (!artboard.value.worker) return;
  // TODO dispatch here would look better not as a tuple perhaps
  dispatch({
    name: "applyBrush",
    params: [brushLastPoint, canvasPoint, weight, color, radius],
  });
}

function clearCircle(coord: Coord, radius: number) {
  if (!artboard.value.worker) return;
  dispatch({
    name: "clearCircle",
    params: [coord, radius],
  });
}

export default {
  artboard,
  reset,
  clearCircle,
  applyBrush,
  resetOrange,
};
