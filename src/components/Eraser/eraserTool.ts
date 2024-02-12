import type { Tool } from "@/lib/Tool";
import { messageBus } from "../Artboard/Artboard";
import { eraserToolState } from "./eraserToolState";
import type { GestureEvent } from "@/lib/GestureEvent";

const tool: Tool = {
  toolType: "eraser",
  gesture,
};

export const useEraserTool = () => tool;

function gesture(gestureEvent: GestureEvent) {
  messageBus.publish({
    name: "clearCircle",
    params: [gestureEvent.currentEvent.at, eraserToolState.value.radius],
  });
}
