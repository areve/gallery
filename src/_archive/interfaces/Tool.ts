export type ToolType = "eraser" | "drag" | "drag-frame" | "pencil";

export interface Tool {
  toolType: ToolType;
  pointerUp(event: PointerEvent): void;
  pointerDown(event: PointerEvent): void;
  pointerMove(event: PointerEvent): void;
}
