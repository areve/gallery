import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata";
import { getDatestamp } from "@/lib/utils";
import { extendMetadata } from "@/lib/artwork-utils";
import { createContext } from "@/lib/canvas/canvas-utils";
import type { ArtworkOnCanvas } from "@/interfaces/Artwork";
import { saveGalleryItem, updateGalleryItem } from "@/components/Gallery/galleryService";

interface Layer {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FlattenOptions {
  metadata: ArtworkMetadata;
  width: number;
  height: number;
  layers: Layer[];
}

async function flatten({ metadata, width, height, layers }: FlattenOptions) {
  const context = createContext(width, height);
  layers.forEach((layer) => {
    context.drawImage(layer.context.canvas, layer.x, layer.y, layer.width, layer.height);
  });

  const name = `composition-${getDatestamp()}.png`;
  const item: ArtworkOnCanvas = {
    name,
    modified: new Date(),
    context,
    status: "ready",
    metadata: extendMetadata(metadata, {
      method: "composition",
      name,
      created: new Date().toISOString(),
    }),
  };

  const finalItem = await saveGalleryItem(item);
  updateGalleryItem(finalItem);
  return finalItem;
}

export function createLayer(context: CanvasRenderingContext2D) {
  return {
    context: context,
    x: 0,
    y: 0,
    width: context.canvas.width,
    height: context.canvas.height,
  } as Layer;
}

export default {
  flatten,
  createLayer,
};
