import type { Tool } from "@/interfaces/Tool";
import { makeBrush } from "@/lib/rgba/rgba-brush";
import { clearCircle } from "@/lib/rgba/rgba-draw";
import artboardService from "@/services/artboardService";
import { eraserSize } from "../services/editorAppState";
import type { CanvasPointerEvent } from "../services/pointerService";

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

function pointerUp(pointerEvent: CanvasPointerEvent) {
  isPointerDown = false
}

function pointerDown(pointerEvent: CanvasPointerEvent) {
  isPointerDown = true
  clearCircle(
    artboardService.artwork.value.rgbaLayer,
    pointerEvent.canvasPoint.x,
    pointerEvent.canvasPoint.y,
    eraserSize.value / 2
  );
}

function pointerMove(
  pointerEvent: CanvasPointerEvent
) {
  if (!isPointerDown) return 
  pointerDown(pointerEvent)
}
