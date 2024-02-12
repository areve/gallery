import type { Tool } from "@/lib/Tool";
import { artboard, messageBus } from "../Artboard/Artboard";
import { eraserToolState } from "./eraserToolState";
import type { GestureEvent } from "@/lib/GestureEvent";

const tool: Tool = {
  toolType: "eraser",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useEraserTool = () => tool;

let isPointerDown = false;

function pointerUp(_: GestureEvent) {
  isPointerDown = false;
}

function pointerDown(gestureEvent: GestureEvent) {
  if (!artboard.canvas) return;

  isPointerDown = true;


  messageBus.publish({
    name: "clearCircle",
    params: [gestureEvent.currentEvent.at, eraserToolState.value.radius],
  });
}

function pointerMove(pointerEvents: GestureEvent) {
  if (!isPointerDown) return;
  pointerDown(pointerEvents);
}
