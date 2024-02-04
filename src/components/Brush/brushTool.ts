import { brushToolState } from "./brushToolState";
import type { Tool } from "@/interfaces/Tool";
import { applyBrush, createBrush } from "@/lib/bitmap/bitmap-brush";
import artboardService from "../ArtboardPanel/artboardService";
import { getCanvasPoint } from "@/services/pointerService";
import { srgb2oklch } from "@/lib/color/color-oklch";
import { color2srgb } from "@/lib/color/color-string";
import { artboardState } from "../ArtboardPanel/artboardState";

const tool: Tool = {
  toolType: "brush",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useBrushTool = () => tool;

const radius = 5;
const brush = createBrush(radius, srgb2oklch(color2srgb(brushToolState.value.brushColor)), artboardState.value.colorSpace);

let brushLastPoint: { x: number; y: number } | null = null;
let isPointerDown = false;

function pointerUp(_: PointerEvent) {
  console.log("brush up");
  brushLastPoint = null;
  isPointerDown = false;
}

function pointerDown(_: PointerEvent) {
  console.log("brush down");
  isPointerDown = true;
}

function pointerMove(pointerEvent: PointerEvent) {
  if (!isPointerDown) return;
  if (!artboardService.artboard.value.context) return;

  const canvasPoint = getCanvasPoint(artboardService.artboard.value.context, {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  });

  const bitmapLayer = artboardService.artboard.value.bitmapLayer;
  if (brushLastPoint) {
    let weight = pointerEvent.pressure ?? 0.1;
    weight = weight * weight;

    // brushMoved, allows the brush to be less like an airbrush
    // but tapping doesn't leave a mark
    const brushMoved = brushLastPoint.x != canvasPoint.x || brushLastPoint.y != canvasPoint.y;
    if (brushMoved) applyBrush(bitmapLayer, brushLastPoint, canvasPoint, brush, weight);
  }

  brushLastPoint = canvasPoint;
}
