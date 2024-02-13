import { createMessageBus } from "@/lib/MessageBus";
import type { Coord } from "@/lib/Coord";
import type { ColorCoord } from "@/lib/Color";
import type { Brush } from "@/lib/Brush";
import { convertBitmapLayer, createBitmapLayer, renderBitmapLayer, type BitmapLayer, type ColorSpace } from "@/lib/BitmapLayer";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { ref, watch, watchPostEffect } from "vue";
import { applyBrush, createBrush } from "@/lib/Brush";
import { brushToolState } from "@/components/Brush/brushToolState";
import { artboardState } from "@/components/Artboard/artboardState";
import { resetAll } from "@/lib/bitmap/bitmap-effects";
import { clearCircle } from "@/lib/bitmap/bitmap-draw";

let canvas: OffscreenCanvas;
let context: OffscreenCanvasRenderingContext2D | null = null;
let bitmapLayer: BitmapLayer | null = null;
let start = new Date().getTime();
let frameCount = 0;
let brush: Brush | undefined = undefined;
const colorSpace = ref<ColorSpace>("oklch");

export const messageBus = createMessageBus(() => self);
messageBus.subscribe("setOffscreenCanvas", onSetOffscreenCanvas);
messageBus.subscribe("setColorSpace", onSetColorSpace);
messageBus.subscribe("resetCanvas", onResetCanvas);
messageBus.subscribe("setBrush", onSetBrush);
messageBus.subscribe("applyBrush", onApplyBrush);
messageBus.subscribe("clearCircle", onClearCircle);

watch(
  () => artboardState.value.colorSpace,
  () => {
    if (!bitmapLayer) return;
    bitmapLayer = convertBitmapLayer(bitmapLayer, artboardState.value.colorSpace);
  }
);

watchPostEffect(() => {
  const srgb = color2srgb(brushToolState.value.color);
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  brush = createBrush(brushToolState.value.radius, colorConvert(srgb), artboardState.value.colorSpace);
});

function reset() {
  console.log("reset");
  if (!context) return;
  console.log("reset", context.canvas.width, context.canvas.height);
  const height = context.canvas.height;
  const width = context.canvas.width;
  bitmapLayer = createBitmapLayer(width, height, colorSpace.value, 32);
  context.clearRect(0, 0, width, height);
}

function render() {
  if (!context) return;
  if (!bitmapLayer) return;
  frameCounter();
  renderBitmapLayer(bitmapLayer, context);
  requestAnimationFrame(render);
}

function frameCounter() {
  const calculateAfterFrames = 60;
  if (++frameCount % calculateAfterFrames === 0) {
    const end = new Date().getTime();
    const duration = end - start;
    const fps = Math.round((calculateAfterFrames / duration) * 1000);
    messageBus.publish({
      name: "reportFps",
      params: [fps],
    });
    start = new Date().getTime();
  }
}

function onSetOffscreenCanvas(offscreenCanvas: OffscreenCanvas) {
  canvas = offscreenCanvas;
  context = canvas.getContext("2d");
  reset();
  requestAnimationFrame(render);
}

function onApplyBrush(fromPoint: Coord | undefined, toPoint: Coord, weight: number) {
  if (!brush) return;
  if (!bitmapLayer) return;
  applyBrush(bitmapLayer, fromPoint, toPoint, brush, weight);
}

function onSetBrush(color: string, radius: number) {
  brushToolState.value.color = color;
  brushToolState.value.radius = radius;
}

function onSetColorSpace(colorSpace: ColorSpace) {
  artboardState.value.colorSpace = colorSpace;
}

function onClearCircle(coord: Coord, radius: number) {
  if (!bitmapLayer) return;
  clearCircle(bitmapLayer, coord.x, coord.y, radius);
}

function onResetCanvas(dimensions: Coord, color: ColorCoord) {
  if (!bitmapLayer) return;
  // TODo foo
  canvas.width = dimensions.x;
  canvas.height = dimensions.y;
  context = canvas.getContext("2d");
  reset();
  resetAll(bitmapLayer, color);
}
