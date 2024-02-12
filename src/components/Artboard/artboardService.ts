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
}

export function attachCanvas(canvas: HTMLCanvasElement) {
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
