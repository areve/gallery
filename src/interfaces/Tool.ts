import type { CanvasPointerEvent } from "@/services/mouseService";

export type ToolType = "eraser" | "drag" | "drag-frame" | "pencil";


export interface Tool {
  toolType: ToolType
  pointerUp(event: CanvasPointerEvent): void
  pointerDown(event: CanvasPointerEvent): void
  pointerMove(event: CanvasPointerEvent): void
}