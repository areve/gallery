import { color2srgb, colorConverter } from "@/lib/color/color";
import { createMessageBus } from "@/lib/MessageBus";
import { artboardState } from "./artboardState";
import { useBrushTool } from "../Brush/brushTool";
import { useEraserTool } from "../Eraser/eraserTool";
import { watchPostEffect } from "vue";
import ArtboardWorker from "./ArtboardWorker?worker";

const messageBus = createMessageBus(() => new ArtboardWorker());
messageBus.subscribe("reportFps", (fps: number) => (artboardState.value.fps = fps));
const tools = [useBrushTool(messageBus), useEraserTool(messageBus)];
let _canvas: HTMLCanvasElement | undefined;

watchPostEffect(() => {
  messageBus.publish({
    name: "setColorSpace",
    params: [artboardState.value.colorSpace],
  });
});

export function resetCanvas(colorString: string) {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb(colorString));
  messageBus.publish({
    name: "resetCanvas",
    params: [color],
  });
}

export function detachCanvas() {
  messageBus.terminateWorker();
  _canvas = undefined;
}

export function attachCanvas(canvas: HTMLCanvasElement) {
  const offscreenCanvas = canvas.transferControlToOffscreen();
  _canvas = canvas;
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
  // TODO too many forced types below
  const imageBlob = (await new Promise<Blob | null>((resolve) => _canvas?.toBlob(resolve)))!;
  return imageBlob;
}

export async function loadBlob(blob: Blob) {
  console.error("TODO load blob to artboard not supported yet", blob);
}
