import { watchPostEffect } from "vue";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { artboardState } from "./artboardState";
import { createMessageBus } from "@/lib/MessageBus";
import ArtboardWorker from "./ArtboardWorker?worker";

export const messageBus = createMessageBus(() => new ArtboardWorker());

export interface Artboard {
  canvas?: HTMLCanvasElement;
}

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

// TODO is this really needed?
export const artboardService = {
  artboard,
  reset,
  resetOrange,
};
