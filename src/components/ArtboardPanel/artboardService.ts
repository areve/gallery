import { ref, watchPostEffect } from "vue";
import type { Artboard } from "../../interfaces/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { artboardState } from "./artboardState";
import { dispatch, startWorker, stopWorker } from "./workerService";

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
    name: "reset",
    params: [color],
  });
}

export function resetOrange() {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("orange"));
  dispatch({
    name: "reset",
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

// TODO any :(
export function updateFps(params: any) {
  artboardState.value.fps = params.fps;
}

export default {
  artboard,
  reset,
  resetOrange,
};
