import type { Tool } from "@/lib/Tool";
import { messageBus } from "../Artboard/Artboard";
import { eraserToolState } from "./eraserToolState";
import type { ArtboardGestureEvent } from "@/lib/ArtboardGestureEvent";

const tool: Tool = {
  toolType: "eraser",
  gesture,
};

export const useEraserTool = () => tool;

function gesture(gestureEvent: ArtboardGestureEvent) {
  messageBus.publish({
    name: "clearCircle",
    params: [gestureEvent.currentEvent.at, eraserToolState.value.radius],
  });
}
