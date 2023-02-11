import type { Tool } from "@/interfaces/Tool";
import { makeBrush } from "@/lib/rgba/rgba-brush";
import { clearCircle } from "@/lib/rgba/rgba-draw";
import artboardService from "@/services/artboardService";
import { eraserSize } from "../services/editorAppState";
import { getCanvasPoint, type BasePointerEvent } from "../services/pointerService";

const tool: Tool = {
  toolType: "eraser",
  pointerUp,
  pointerDown,
  pointerMove,
}

export const useEraserTool = () => tool

const radius = 5; // needs to be a integer, I like 5 - 30 is good for debugging colour mixing

const brush = makeBrush(radius);
let isPointerDown = false

function pointerUp(pointerEvents: BasePointerEvent[]) {
  isPointerDown = false
}

function pointerDown(pointerEvents: BasePointerEvent[]) {
  isPointerDown = true
  const canvasPoint = getCanvasPoint(artboardService.artwork.value.context, pointerEvents[0].point)

  clearCircle(
    artboardService.artwork.value.rgbaLayer,
    canvasPoint.x,
    canvasPoint.y,
    eraserSize.value / 2
  );
}

function pointerMove(pointerEvents: BasePointerEvent[]) {
  if (!isPointerDown) return 
  pointerDown(pointerEvents)
}
