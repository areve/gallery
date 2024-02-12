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

export const messageBus = setupMessageBus();

function setupMessageBus() {
  const messageBus = createMessageBus(() => self);
  messageBus.subscribe("setOffscreenCanvas", setOffscreenCanvas);
  messageBus.subscribe("setColorSpace", onSetColorSpace);
  messageBus.subscribe("resetCanvas", onResetCanvas);
  messageBus.subscribe("setBrush", onSetBrush);
  messageBus.subscribe("brush:apply", onBrushApply);
  messageBus.subscribe("clearCircle", onClearCircle);
  return messageBus;
}

function setOffscreenCanvas(offscreenCanvas: OffscreenCanvas) {
  canvas = offscreenCanvas;
  context = canvas.getContext("2d");
  reset();
  requestAnimationFrame(render);
}

function reset() {
  if (!context) return;
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
      name: "fps:changed",
      params: [fps],
    });
    start = new Date().getTime();
  }
}

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

function onBrushApply(fromPoint: Coord | undefined, toPoint: Coord, weight: number) {
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

function onResetCanvas(color: ColorCoord) {
  if (!bitmapLayer) return;
  resetAll(bitmapLayer, color);
}
