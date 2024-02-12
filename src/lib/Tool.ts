import type { GestureEvent } from "./GestureEvent";
export type ToolType = "brush" | "eraser";

export interface Tool {
  toolType: ToolType;
  gesture(event: GestureEvent): void;
}
