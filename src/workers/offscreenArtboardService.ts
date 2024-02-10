import type { BitmapLayer, ColorSpace } from "@/interfaces/BitmapLayer";
import type { Coord } from "@/interfaces/Coord";
import type { ColorCoord } from "@/interfaces/Color";
import type { Brush } from "@/interfaces/Brush";
import { convertBitmapLayer, createBitmapLayer, renderBitmapLayer } from "@/lib/bitmap-layer";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { ref, watch, watchPostEffect } from "vue";
import { applyBrush, createBrush } from "@/lib/bitmap/bitmap-brush";
import { brushToolState } from "@/components/Brush/brushToolState";
import { artboardState } from "@/components/ArtboardPanel/artboardState";
import { resetAll } from "@/lib/bitmap/bitmap-effects";
import { clearCircle } from "@/lib/bitmap/bitmap-draw";
import type { MessageBus } from "@/services/actionService";

let canvas: OffscreenCanvas;
let context: OffscreenCanvasRenderingContext2D | null = null;
let bitmapLayer: BitmapLayer | null = null;
let start = new Date().getTime();
let frameCount = 0;
let brush: Brush | undefined = undefined;
let _messageBus: MessageBus | null = null;
const colorSpace = ref<ColorSpace>("oklch");

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
    _messageBus?.publish({
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

// TODO order of params was easy to get wrong and names are inconstent
function onBrushApply(fromPoint: Coord, toPoint: Coord, weight: number, color: ColorCoord, radius: number) {
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

export function registerActions(messageBus: MessageBus) {
  //TODO caching _messageBus, is this best?

  _messageBus = messageBus;
  messageBus.subscribe("setOffscreenCanvas", setOffscreenCanvas);
  messageBus.subscribe("setColorSpace", onSetColorSpace);
  messageBus.subscribe("resetCanvas", onResetCanvas);
  messageBus.subscribe("setBrush", onSetBrush);
  messageBus.subscribe("brush:apply", onBrushApply);
  messageBus.subscribe("clearCircle", onClearCircle);
}
