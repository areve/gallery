import { clone, rectanglesIntersect } from "@/lib/utils";
import { cloneContext, createContext, autoCropImage } from "@/lib/canvas-utils";
import { ref } from "vue";
import type { Artwork, ArtworkActive } from "@/interfaces/Artwork";
import {
  loadGalleryItem,
  saveGalleryItem,
  updateGalleryItem,
} from "./galleryService";

const artwork = ref<ArtworkActive>({
  status: "ready",
  filename: "",
  modified: new Date(),
  metadata: { history: [] },
  frame: {
    x: 0,
    y: 0,
    width: 1024,
    height: 1024,
  },

  bounds: {
    x: 0,
    y: 0,
    width: 1024,
    height: 1024,
  },
  context: undefined!,
  overlayContext: undefined!,
  rgbaLayer: undefined!,
});

function resetFrame() {
  artwork.value.frame = {
    x: 0,
    y: 0,
    width: artwork.value.bounds.width,
    height: artwork.value.bounds.height,
  };
}

function drawOverlay() {
  artwork.value.overlayContext.clearRect(
    0,
    0,
    artwork.value.bounds.width,
    artwork.value.bounds.height
  );
  artwork.value.overlayContext.fillStyle = "#77777777";
  artwork.value.overlayContext.fillRect(
    0,
    0,
    artwork.value.bounds.width,
    artwork.value.bounds.height
  );
  artwork.value.overlayContext.clearRect(
    artwork.value.frame.x,
    artwork.value.frame.y,
    artwork.value.frame.width,
    artwork.value.frame.height
  );
}

export function render() {
  if (!artwork.value.context) return;
  const context = artwork.value.context;
  if (artwork.value.modified === artwork.value.rgbaLayer.modified) return;
  artwork.value.modified = artwork.value.rgbaLayer.modified;

  const data = artwork.value.rgbaLayer.data;
  const w = context.canvas.width;
  const h = context.canvas.height;
  const imageData = context.getImageData(0, 0, w, h);
  const pix = imageData.data;

  const channels = 4;
  const max = w * h * channels;
  for (let i = 0; i < max; i += channels) {
    pix[i] = Math.floor(data[i] * 255);
    pix[i + 1] = Math.floor(data[i + 1] * 255);
    pix[i + 2] = Math.floor(data[i + 2] * 255);
    pix[i + 3] = Math.floor(data[i + 3] * 255);
  }

  context.putImageData(imageData, 0, 0);
}

function resetRgbaLayer() {
  const channels = 4;
  const height = artwork.value.context.canvas.height;
  const width = artwork.value.context.canvas.width;
  artwork.value.rgbaLayer = {
    height,
    width,
    data: new Float32Array(width * height * channels),
    modified: new Date(),
  };

  const imageData = artwork.value.context.getImageData(0, 0, width, height);
  const pix = imageData.data;

  const data = artwork.value.rgbaLayer.data;
  const max = width * height * channels;
  for (let i = 0; i < max; i += channels) {
    data[i] = pix[i] / 255;
    data[i + 1] = pix[i + 1] / 255;
    data[i + 2] = pix[i + 2] / 255;
    data[i + 3] = pix[i + 3] / 255;
  }
}

export function resetArtwork() {
  if (!artwork.value.context) return;
  const [width, height] = [1024, 1024];
  artwork.value.bounds.width = width;
  artwork.value.bounds.height = height;
  artwork.value.context.clearRect(
    0,
    0,
    artwork.value.context.canvas.width,
    artwork.value.context.canvas.height
  );

  resetRgbaLayer();

  artwork.value.metadata = { history: [] };
  artwork.value.filename = "";
  artwork.value.modified = new Date();
  resetFrame();
  drawOverlay();
}

async function scale(by: number) {
  if (artwork.value.bounds.width <= 1 && by < 1) return;
  if (artwork.value.bounds.width >= 5120 && by > 1) return;
  const clone = cloneContext(artwork.value.context);
  artwork.value.context.clearRect(
    0,
    0,
    artwork.value.context.canvas.width,
    artwork.value.context.canvas.height
  );
  artwork.value.bounds.width = Math.min(5120, artwork.value.bounds.width * by);
  artwork.value.bounds.height = Math.min(
    5120,
    artwork.value.bounds.height * by
  );
  const dx = (artwork.value.bounds.width - clone.canvas.width) / 2;
  const dy = (artwork.value.bounds.width - clone.canvas.width) / 2;
  artwork.value.context.drawImage(
    clone.canvas,
    dx,
    dy,
    clone.canvas.width,
    clone.canvas.height
  );

  const scaleArtwork_keepFrameSize = false;
  if (scaleArtwork_keepFrameSize) {
    artwork.value.frame.x += dx;
    artwork.value.frame.y += dy;
  } else {
    artwork.value.frame.width = artwork.value.bounds.width;
    artwork.value.frame.height = artwork.value.bounds.height;
  }

  if (
    !rectanglesIntersect(artwork.value.frame, {
      x: 0,
      y: 0,
      width: artwork.value.bounds.width,
      height: artwork.value.bounds.height,
    })
  ) {
    resetFrame();
  }
  drawOverlay();
  resetRgbaLayer();
}

function createContextFromFrame(width: number, height: number) {
  const image = createContext(width, height);
  image.drawImage(
    artwork.value.context.canvas,
    artwork.value.frame.x,
    artwork.value.frame.y,
    artwork.value.frame.width,
    artwork.value.frame.height,
    0,
    0,
    width,
    height
  );
  return image;
}

function growFrame(by: number) {
  if (artwork.value.frame.width <= 512 && by < 1) return;
  if (artwork.value.frame.width >= 5120 && by > 1) return;
  artwork.value.frame.x -= by / 2;
  artwork.value.frame.y -= by / 2;
  artwork.value.frame.width = artwork.value.frame.width + by;
  artwork.value.frame.height = artwork.value.frame.height + by;
  drawOverlay();
}

async function autoCrop() {
  const cropped = await autoCropImage(artwork.value.context);
  artwork.value.bounds.width = cropped.canvas.width;
  artwork.value.bounds.height = cropped.canvas.height;
  artwork.value.context.drawImage(cropped.canvas, 0, 0);
  resetRgbaLayer();
}

async function load(item: Artwork) {
  const artworkImage = await loadGalleryItem(item);
  artwork.value.bounds.width = artworkImage.image.width;
  artwork.value.bounds.height = artworkImage.image.height;
  artwork.value.context.clearRect(
    0,
    0,
    artwork.value.context.canvas.width,
    artwork.value.context.canvas.height
  );

  resetFrame();

  artwork.value.context.drawImage(artworkImage.image, 0, 0);
  artwork.value.filename = artworkImage.filename;
  artwork.value.metadata = clone(artworkImage.metadata);
  artwork.value.modified = new Date(artworkImage.modified);
  resetRgbaLayer();
}

async function save() {
  const item = await saveGalleryItem(artwork.value);
  artwork.value.filename = item.filename;
  artwork.value.metadata = item.metadata;
  updateGalleryItem(item);
  return item;
}

async function scaleImage(by: number) {
  const context = artwork.value.context;
  const clone = cloneContext(artwork.value.context);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  context.drawImage(
    clone.canvas,
    (context.canvas.width - clone.canvas.width * by) / 2,
    (context.canvas.height - clone.canvas.height * by) / 2,
    clone.canvas.width * by,
    clone.canvas.height * by
  );

  resetRgbaLayer();
}

export default {
  resetFrame,
  createContextFromFrame,
  growFrame,
  autoCrop,
  artwork,
  scale,
  resetArtwork,
  drawOverlay,
  load,
  save,
  render,
  scaleImage,
  resetRgbaLayer,
};
