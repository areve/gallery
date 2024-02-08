import { brushToolState } from "./../components/Brush/brushToolState";
import type { Rect } from "./../interfaces/Rect";
import type { BitmapLayer, ColorSpace } from "@/interfaces/BitmapLayer";
import type { Brush } from "@/interfaces/Brush";
import { convertBitmapLayer, createBitmapLayer } from "@/lib/bitmap-layer";
import { applyBrush, createBrush } from "@/lib/bitmap/bitmap-brush";
import { resetAll } from "@/lib/bitmap/bitmap-effects";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { rectsOverlappedByAny } from "@/lib/rect";
import { ref, watch, watchPostEffect } from "vue";
import { actions, type ArtboardWorkerMessage } from "./ArtboardWorkerInterfaces";
import { artboardState } from "@/components/ArtboardPanel/artboardState";
import { clearCircle } from "@/lib/bitmap/bitmap-draw";
import { setBrush } from "@/components/Brush/brushService";

// TODO rename this to worker.ts? make it a generic dispatcher?
let context: OffscreenCanvasRenderingContext2D | null = null;
let canvas: OffscreenCanvas;

let tempImageData: ImageData | null = null;
let i = 0;
let start = new Date().getTime();
let bitmapLayer: BitmapLayer | null = null;
const colorSpace = ref<ColorSpace>("oklch");
let brush: Brush | undefined = undefined;

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

function frameCounter() {
  const calculateAfterFrames = 60;
  if (++i % calculateAfterFrames === 0) {
    const end = new Date().getTime();
    const duration = end - start;
    const fps = Math.round((calculateAfterFrames / duration) * 1000);
    postMessage({
      action: "fps",
      params: {
        fps,
      },
    });
    start = new Date().getTime();
  }
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
  const dirtyTiles = rectsOverlappedByAny(bitmapLayer.tiles, bitmapLayer.dirty);
  dirtyTiles.forEach(renderRect);
  bitmapLayer.dirty = [];
  requestAnimationFrame(render);
}

function renderRect(rect: Rect) {
  if (!context) return;
  if (!bitmapLayer) return;

  if (!tempImageData || tempImageData.width != rect.width || tempImageData.height != rect.height) {
    tempImageData = new ImageData(rect.width, rect.height);
  }

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

onmessage = function (event: MessageEvent<ArtboardWorkerMessage>) {
  // event.data.service === "artboard"
  // event.data.service === "brush"
  // if (event.data.service === "eraserService") {
  //   eraserService[event.data.action](event.data.params)
  // }
  console.log(
    "find in",
    event.data[0],
    actions.map((x) => x.spec)
  );
  const fn = actions.find((x) => x.spec[0] === event.data[0]);
  if (fn) {
    console.log("found", event.data[0], event.data[1]);
    fn.action.apply(null, event.data[1] as any);
    return;
  }

  if (event.data.action === "initialize") {
    canvas = event.data.params.offscreenCanvas;
    context = canvas.getContext("2d");
    reset();
    requestAnimationFrame(render);
  } else if (!bitmapLayer) return;
  else if (event.data.action === "reset") {
    resetAll(bitmapLayer, event.data.params.color);
  } else if (event.data.action === "applyBrush") {
    const params = event.data.params;
    if (!brush) return;
    applyBrush(bitmapLayer, params.fromPoint, params.toPoint, brush, params.weight);
  } else if (event.data.action === "setColorSpace") {
    console.log("setColorSpace", event.data.params.colorSpace);
    artboardState.value.colorSpace = event.data.params.colorSpace;
  } else if (event.data.action === "setBrush") {
    setBrush(event.data.params.color, event.data.params.radius);
  } else if (event.data.action === "clearCircle") {
    clearCircle(bitmapLayer, event.data.params.coord.x, event.data.params.coord.y, event.data.params.radius);
  } else {
    throw "artboardWorker unsupported message: " + event.data;
  }
};

export {};
