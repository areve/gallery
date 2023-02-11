import type { BasePointerEvent } from "@/services/pointerService";

export type ToolType = "eraser" | "drag" | "drag-frame" | "pencil";


export interface Tool {
  toolType: ToolType
  pointerUp(event: BasePointerEvent): void
  pointerDown(event: BasePointerEvent): void
  pointerMove(event: BasePointerEvent): void
}