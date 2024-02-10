import { ref, watchPostEffect } from "vue";
import type { Artboard } from "../../interfaces/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { artboardState } from "./artboardState";
import { actions, dispatch, messageBus, startWorker, stopWorker } from "./workerService";

// TODO why ref?
const artboard = ref<Artboard>({
  canvas: undefined,
});

watchPostEffect(() => {
  dispatch({
    name: "setColorSpace",
    params: [artboardState.value.colorSpace],
  });
});

export function reset() {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("white"));
  dispatch({
    name: "resetCanvas",
    params: [color],
  });
}

export function resetOrange() {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("orange"));
  dispatch({
    name: "resetCanvas",
    params: [color],
  });
}

export function detachCanvas() {
  artboard.value.canvas = undefined;
  stopWorker();
}

export function attachToCanvas(canvas: HTMLCanvasElement) {
  detachCanvas();
  startWorker();

  //TODO this needs to be more like an add event listner
  if (!messageBus) throw "messageBus not ready";
  messageBus.subscribe("fps:changed", onFpsChanged);
  actions["fps:changed"] = onFpsChanged;

  artboard.value.canvas = canvas;
  const offscreenCanvas = canvas.transferControlToOffscreen();

  messageBus.publish(
    {
      name: "setOffscreenCanvas",
      params: [offscreenCanvas],
    },
    [offscreenCanvas]
  );
}

export function onFpsChanged(fps: number) {
  artboardState.value.fps = fps;
}

export default {
  artboard,
  reset,
  resetOrange,
};
