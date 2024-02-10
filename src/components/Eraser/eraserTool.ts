import type { Tool } from "@/interfaces/Tool";
import { getCanvasPoint } from "@/services/pointerService";
import artboardService, { messageBus } from "../ArtboardPanel/artboardService";
import { eraserToolState } from "./eraserToolState";

const tool: Tool = {
  toolType: "eraser",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useEraserTool = () => tool;

let isPointerDown = false;

function pointerUp(_: PointerEvent) {
  isPointerDown = false;
}

function pointerDown(pointerEvent: PointerEvent) {
  if (!artboardService.artboard.canvas) return;

  isPointerDown = true;

  const canvasPoint = getCanvasPoint(artboardService.artboard.canvas, {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  });

  messageBus.publish({
    name: "clearCircle",
    params: [canvasPoint, eraserToolState.value.radius],
  });
}

function pointerMove(pointerEvents: PointerEvent) {
  if (!isPointerDown) return;
  pointerDown(pointerEvents);
}
