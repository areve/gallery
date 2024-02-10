import { watchPostEffect } from "vue";
import type { Artboard } from "../../lib/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { artboardState } from "./artboardState";
import { createMessageBus } from "@/lib/MessageBus";
import ArtboardWorker from "./ArtboardWorker?worker";

// TODO this file is call artboardService, is that right?
export const messageBus = createMessageBus(() => new ArtboardWorker());

const artboard: Artboard = {
  canvas: undefined,
};

watchPostEffect(() => {
  messageBus.publish({
    name: "setColorSpace",
    params: [artboardState.value.colorSpace],
  });
});

export function reset() {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("white"));
  messageBus.publish({
    name: "resetCanvas",
    params: [color],
  });
}

export function resetOrange() {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("orange"));
  messageBus.publish({
    name: "resetCanvas",
    params: [color],
  });
}

export function detachCanvas() {
  artboard.canvas = undefined;
  messageBus.terminateWorker();
}

export function attachToCanvas(canvas: HTMLCanvasElement) {
  if (artboard.canvas) detachCanvas();

  if (!messageBus) throw "messageBus not ready";
  messageBus.subscribe("fps:changed", onFpsChanged);

  artboard.canvas = canvas;
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
