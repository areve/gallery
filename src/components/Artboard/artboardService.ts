import { color2srgb, colorConverter } from "@/lib/color/color";
import { createMessageBus } from "@/lib/MessageBus";
import { artboardState } from "./artboardState";
import { useBrushTool } from "../Brush/brushTool";
import { useEraserTool } from "../Eraser/eraserTool";
import { watchPostEffect, watchSyncEffect } from "vue";
import ArtboardWorker from "./ArtboardWorker?worker";
import type { Coord } from "@/lib/Coord";
import { blobToImage } from "@/lib/utils";

const messageBus = createMessageBus(() => new ArtboardWorker());
messageBus.subscribe("reportFps", (fps: number) => (artboardState.value.fps = fps));
const tools = [useBrushTool(messageBus), useEraserTool(messageBus)];
let currentCanvas: HTMLCanvasElement | undefined;

watchPostEffect(() => {
  messageBus.publish({
    name: "setColorSpace",
    params: [artboardState.value.colorSpace],
  });
});

watchSyncEffect(setCanvasDimensions);

function setCanvasDimensions() {
  if (!currentCanvas) return;
  currentCanvas.width = artboardState.value.dimensions.x;
  currentCanvas.height = artboardState.value.dimensions.y;
}

export function resetCanvas(dimensions: Coord, colorString: string) {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb(colorString));

  artboardState.value.dimensions = dimensions;
  messageBus.publish({
    name: "resetCanvas",
    params: [dimensions, color],
  });
}

export function detachCanvas() {
  messageBus.terminateWorker();
  currentCanvas = undefined;
}

export function attachCanvas(canvas: HTMLCanvasElement) {
  currentCanvas = canvas;
  setCanvasDimensions();
  const offscreenCanvas = canvas.transferControlToOffscreen();
  messageBus.publish(
    {
      name: "setOffscreenCanvas",
      params: [offscreenCanvas],
    },
    [offscreenCanvas]
  );
}

export function selectedTool() {
  return tools.find((tool) => tool.toolType === artboardState.value.selectedTool) || tools[0];
}

export async function getAsBlob() {
  // TODO too many forced types in the line below
  // TODO I'm suprised this worked after send to offscreen, better to save in a thread anyway?
  const imageBlob = (await new Promise<Blob | null>((resolve) => currentCanvas?.toBlob(resolve)))!;
  return imageBlob;
}

export async function loadBlob(blob: Blob) {
  // TODO load to blob is also going to need to set the canvas size!?
  console.error("TODO load blob to artboard not supported yet", blob);
  const image = await blobToImage(blob);
  console.error("TODO load blob to artboard not supported yet", image);
}
