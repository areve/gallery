import type { GestureEvent } from "./GestureEvent";
export type ToolType = "brush" | "eraser";

export interface Tool {
  toolType: ToolType;
  pointerUp(event: GestureEvent): void;
  pointerDown(event: GestureEvent): void;
  pointerMove(event: GestureEvent): void;
}
