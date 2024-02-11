import type { Tool } from "@/lib/Tool";
import { getCanvasPoint } from "@/services/pointerService";
import { artboard, messageBus } from "../Artboard/Artboard";
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
  if (!artboard.canvas) return;

  isPointerDown = true;

  const canvasPoint = getCanvasPoint(artboard.canvas, {
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
