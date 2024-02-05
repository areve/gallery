import { artboardState } from "@/components/ArtboardPanel/artboardState";
import type { Brush } from "@/interfaces/Brush";
import { brushToolState } from "./brushToolState";
import type { Tool } from "@/interfaces/Tool";
import { applyBrush, createBrush } from "@/lib/bitmap/bitmap-brush";
import artboardService from "../ArtboardPanel/artboardService";
import { getCanvasPoint } from "@/services/pointerService";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { watchPostEffect } from "vue";
import type { ColorSpace } from "@/interfaces/BitmapLayer";

const tool: Tool = {
  toolType: "brush",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useBrushTool = () => tool;

let brush: Brush = undefined!;
let brushLastPoint: { x: number; y: number } | null = null;
let isPointerDown = false;

watchPostEffect(() => {
  brush = createColoredBrush(artboardState.value.colorSpace);
});

function createColoredBrush(colorSpace: ColorSpace) {
  const color = colorConverter("srgb", colorSpace)(color2srgb(brushToolState.value.color));
  return createBrush(brushToolState.value.radius, color, artboardState.value.colorSpace);
}

function pointerUp(_: PointerEvent) {
  brushLastPoint = null;
  isPointerDown = false;
}

function pointerDown(_: PointerEvent) {
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
