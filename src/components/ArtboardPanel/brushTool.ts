import type { Tool } from "@/interfaces/Tool";
import { applyBrush, createBrush } from "@/lib/bitmap/bitmap-brush";
import { watchPostEffect } from "vue";
import artboardService from "./artboardService";
import { getCanvasPoint } from "@/services/pointerService";
import { srgb2oklch } from "@/lib/color/color-oklch";
import { color2srgb } from "@/lib/color/color-string";

const tool: Tool = {
  toolType: "brush",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useBrushTool = () => tool;

const radius = 5; // TODO need a better way to set radius

let brush = createBrush(radius, srgb2oklch(color2srgb("black")), "oklch");

watchPostEffect(() => {
  if (!artboardService.artwork.value.bitmapLayer) return;
  const color = srgb2oklch(color2srgb("green"));
  brush = createBrush(radius, color, "oklch");
});

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
  if (!artboardService.artwork.value.context) return;

  const canvasPoint = getCanvasPoint(artboardService.artwork.value.context, {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  });

  const bitmapLayer = artboardService.artwork.value.bitmapLayer;
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
