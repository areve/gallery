import { watchPostEffect } from "vue";
import { artboardState } from "./artboardState";
import { createMessageBus } from "@/lib/MessageBus";
import ArtboardWorker from "./ArtboardWorker?worker";

export const messageBus = createMessageBus(() => new ArtboardWorker());

export interface Artboard {
  canvas?: HTMLCanvasElement;
}

// TODO is this not the same as artboardState?
// TODO a static variable here is not good perhaps?
// TODO perhaps this and the messageBus should just go to the Panel?
export const artboard: Artboard = {
  canvas: undefined,
};

watchPostEffect(() => {
  messageBus.publish({
    name: "setColorSpace",
    params: [artboardState.value.colorSpace],
  });
});

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
