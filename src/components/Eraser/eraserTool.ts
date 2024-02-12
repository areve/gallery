import type { Tool } from "@/lib/Tool";
import { artboardMessageBus } from "../Artboard/Artboard";
import { eraserToolState } from "./eraserToolState";
import type { ArtboardGestureEvent } from "@/lib/ArtboardGestureEvent";

const tool: Tool = {
  toolType: "eraser",
  gesture,
};

export const useEraserTool = () => tool;

function gesture(gestureEvent: ArtboardGestureEvent) {
  artboardMessageBus.publish({
    name: "clearCircle",
    params: [gestureEvent.currentEvent.at, eraserToolState.value.radius],
  });
}
