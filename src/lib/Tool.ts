import type { GestureEvent } from "@/services/pointerService";
export type ToolType = "brush" | "eraser";

export interface Tool {
  toolType: ToolType;
  pointerUp(event: GestureEvent): void;
  pointerDown(event: GestureEvent): void;
  pointerMove(event: GestureEvent): void;
}
