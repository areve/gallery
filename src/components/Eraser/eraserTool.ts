import type { Tool } from "@/lib/Tool";
import { eraserToolState } from "./eraserToolState";
import type { ArtboardGestureEvent } from "@/lib/ArtboardGestureEvent";
import type { MessageBus } from "@/lib/MessageBus";

export const useEraserTool = (messageBus: MessageBus) => {
  const tool: Tool = {
    toolType: "eraser",
    gesture,
  };

  return tool;

  function gesture(gestureEvent: ArtboardGestureEvent) {
    messageBus.publish({
      name: "clearCircle",
      params: [gestureEvent.currentEvent.at, eraserToolState.value.radius],
    });
  }
};
