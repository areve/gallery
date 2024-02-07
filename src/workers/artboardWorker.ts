import type { ColorCoord } from "./../interfaces/Color";
import type { Rect } from "./../interfaces/Rect";
import type { BitmapLayer, ColorSpace } from "@/interfaces/BitmapLayer";
import type { Brush } from "@/interfaces/Brush";
import { createBitmapLayer } from "@/lib/bitmap-layer";
import { applyBrush, createBrush } from "@/lib/bitmap/bitmap-brush";
import { resetAll } from "@/lib/bitmap/bitmap-effects";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { rectsOverlappedByAny } from "@/lib/rect";
import { ref, watchPostEffect } from "vue";

let context: OffscreenCanvasRenderingContext2D | null = null;
let canvas: OffscreenCanvas;
let imageData: ImageData | null = null;
let tempImageData: ImageData | null = null;
let i = 0;
let start = new Date().getTime();
let bitmapLayer: BitmapLayer | null = null;
let colorSpace = ref<ColorSpace>("oklch");
let brush: Brush | undefined = undefined;
function animate() {
  if (context) {
    i++;

    if (!imageData) imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 255;
    }

    context.putImageData(imageData, 0, 0);

    const frameInterval = 100;
    if (i % frameInterval === 0) {
      const end = new Date().getTime();
      const duration = end - start;
      const fps = Math.round((frameInterval / duration) * 1000);
      console.log(`${frameInterval} frames took ${duration}ms, ${fps}fps`);
      start = new Date().getTime();
    }
  }
  //  requestAnimationFrame(animate);
}

function reset() {
  if (!context) return;
  // const context = context;
  const height = context.canvas.height;
  const width = context.canvas.width;
  bitmapLayer = createBitmapLayer(width, height, colorSpace.value, 32);
  context.clearRect(0, 0, width, height);
}

function render() {
  if (!context) return;
  if (!bitmapLayer) return;
  // if (!bitmapLayer.dirty.length) return;

  const dirtyTiles = rectsOverlappedByAny(bitmapLayer.tiles, bitmapLayer.dirty);
  dirtyTiles.forEach(renderRect);
  bitmapLayer.dirty = [];

  // animate();
  requestAnimationFrame(render);
}

function renderRect(rect: Rect) {
  if (!context) return;
  if (!bitmapLayer) return;

  if (!tempImageData || tempImageData.width != rect.width || tempImageData.height != rect.height) {
    tempImageData = new ImageData(rect.width, rect.height);
  }

  // const context = context;
  const pixelData = tempImageData.data;
  const layerData = bitmapLayer.data;
  const width = bitmapLayer.width;
  const channels = bitmapLayer.channels;
  const convert = colorConverter(bitmapLayer.space, "srgb");
  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      const i = ((y + rect.y) * width + x + rect.x) * channels;
      const o = (y * rect.width + x) * channels;
      const rgb = convert([layerData[i + 0], layerData[i + 1], layerData[i + 2]]);
      pixelData[o + 0] = rgb[0] * 255;
      pixelData[o + 1] = rgb[1] * 255;
      pixelData[o + 2] = rgb[2] * 255;
      pixelData[o + 3] = layerData[i + 3] * 255;
    }
  }

  context.putImageData(tempImageData, rect.x, rect.y);
}

watchPostEffect(() => {
  console.log("colorSpace changed", colorSpace.value);
});

onmessage = function (event: MessageEvent) {
  colorSpace.value = event.data.colorSpace || colorSpace.value;
  console.log("applyBrush", !!brush, event.data.params);
  if (event.data.canvas) {
    canvas = event.data.canvas;
    context = canvas.getContext("2d");
    reset();

    requestAnimationFrame(render);
  }

  if (bitmapLayer && event.data.resetAll) {
    resetAll(bitmapLayer, event.data.resetAll);
  }
  if (bitmapLayer && event.data.action) {
    if (event.data.action === "createColoredBrush") {
      console.log("createColoredBrush", event.data.params);
      brush = createColoredBrush(event.data.params.colorSpace, event.data.params.color, event.data.params.radius);
    }
    if (event.data.action === "applyBrush") {
      if (!brush) brush = createColoredBrush(event.data.params.colorSpace, event.data.params.color, event.data.params.radius);
      // console.log("applyBrush",  event.data.params);
      applyBrush(bitmapLayer, event.data.params.brushLastPoint, event.data.params.canvasPoint, brush, event.data.params.weight)
    }
    // resetAll(bitmapLayer, event.data.resetAll);
  }
};

function createColoredBrush(colorSpace: ColorSpace, color: ColorCoord, radius: number) {
  //const color = colorSpace;
  return createBrush(radius, color, colorSpace);
}

export {};
