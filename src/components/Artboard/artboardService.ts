import { color2srgb, colorConverter } from "@/lib/color/color";
import { createMessageBus } from "@/lib/MessageBus";
import { artboardState } from "./artboardState";
import { useBrushTool } from "../Brush/brushTool";
import { useEraserTool } from "../Eraser/eraserTool";
import { watchPostEffect } from "vue";
import ArtboardWorker from "./ArtboardWorker?worker";
import type { Coord } from "@/lib/Coord";
import { blobToImage } from "@/lib/Blob";

const messageBus = createMessageBus(() => new ArtboardWorker());
messageBus.subscribe("reportFps", (fps: number) => (artboardState.value.fps = fps));
const tools = [useBrushTool(messageBus), useEraserTool(messageBus)];
let currentCanvas: HTMLCanvasElement | undefined;

watchPostEffect(() => {
  messageBus.publish("setColorSpace", [artboardState.value.colorSpace]);
});

export function resetCanvas(dimensions: Coord, colorString: string) {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb(colorString));

  artboardState.value.dimensions = dimensions;
  messageBus.publish("resetCanvas", [dimensions, color]);
}

export function detachCanvas() {
  messageBus.terminateWorker();
  currentCanvas = undefined;
}

export function attachCanvas(canvas: HTMLCanvasElement) {
  currentCanvas = canvas;
  currentCanvas.width = artboardState.value.dimensions.x;
  currentCanvas.height = artboardState.value.dimensions.y;
  const offscreenCanvas = canvas.transferControlToOffscreen();
  messageBus.publish("setOffscreenCanvas", [offscreenCanvas], [offscreenCanvas]);
}

export function selectedTool() {
  return tools.find((tool) => tool.toolType === artboardState.value.selectedTool) || tools[0];
}

export async function asBlob() {
  return new Promise<Blob>((resolve, reject) => {
    currentCanvas?.toBlob((blob) => {
      if (!blob) return reject("blob was null");
      resolve(blob);
    });
  });
}

export async function loadBlob(blob: Blob) {
  const image = await blobToImage(blob);
  const dimensions = {
    x: image.width,
    y: image.height,
  };
  artboardState.value.dimensions = dimensions;
  await messageBus.request("loadBlob", [blob]);
}
