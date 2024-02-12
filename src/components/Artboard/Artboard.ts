import { watchPostEffect } from "vue";
import { artboardState } from "./artboardState";
import { createMessageBus } from "@/lib/MessageBus";
import ArtboardWorker from "./ArtboardWorker?worker";

// TODO instead of exporting this perhaps export a wrapper class?
export const artboardMessageBus = createMessageBus(() => new ArtboardWorker());

// TODO a static variable here is not good perhaps?
// TODO perhaps this and the messageBus should just go to the Panel?
let _canvas: HTMLCanvasElement | undefined;

watchPostEffect(() => {
  artboardMessageBus.publish({
    name: "setColorSpace",
    params: [artboardState.value.colorSpace],
  });
});

export function detachCanvas() {
  _canvas = undefined;
  artboardMessageBus.terminateWorker();
}

export function attachToCanvas(canvas: HTMLCanvasElement) {
  if (_canvas) detachCanvas();

  if (!artboardMessageBus) throw "messageBus not ready";
  artboardMessageBus.subscribe("fps:changed", onFpsChanged);

  _canvas = canvas;
  const offscreenCanvas = canvas.transferControlToOffscreen();
  artboardMessageBus.publish(
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
