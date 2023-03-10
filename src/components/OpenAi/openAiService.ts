import { clone, getDatestamp, last } from "@/lib/utils";
import { extendMetadata } from "@/lib/artwork-utils";
import { imageCountEmptyPixels } from "@/lib/canvas/canvas-utils";
import { openAiEditImage, openAiGenerateImage, openAiImageVariation } from "@/components/OpenAi/openAiApi";
import { ref } from "vue";
import { saveGalleryItem, updateGalleryItem } from "../Gallery/galleryService";
import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata";
import type { Artwork, ArtworkError, ArtworkInMemory } from "@/interfaces/Artwork";
import type { ImageResultError, ImageResultReady } from "@/interfaces/OpenAiResponse";
import { usePersistentState } from "../../services/persistenceService";

const config = ref({
  openApiKey: "",
});

interface GenerateOptions {
  prompt: string;
}

interface OutpaintOptions {
  prompt: string;
  image: CanvasRenderingContext2D;
  metadata: ArtworkMetadata;
}

interface VariationOptions {
  image: CanvasRenderingContext2D;
  metadata: ArtworkMetadata;
}

async function generate({ prompt }: GenerateOptions) {
  if (!prompt.trim()) {
    alert("no prompt!");
    return;
  }

  const name = `generation-${getDatestamp()}.png`;
  const item: Artwork = {
    name,
    status: "waiting",
    modified: new Date(),
    metadata: {
      history: [
        {
          method: "generation",
          prompt,
          name,
          version: "OpenAI",
        },
      ],
    },
  };

  updateGalleryItem(item);
  const imageResult = await openAiGenerateImage({ prompt }, config.value.openApiKey);
  return await handleImageResult(imageResult, item);
}

async function outpaint({ prompt, image, metadata }: OutpaintOptions) {
  if (!prompt.trim()) {
    alert("no prompt!");
    return;
  }

  if ((await imageCountEmptyPixels(image)) === 0) {
    alert("no empty pixels!");
    return;
  }

  const imageBlob = (await new Promise<Blob | null>((resolve) => image.canvas.toBlob(resolve)))!;
  const name = `outpaint-${getDatestamp()}.png`;
  const item: Artwork = {
    name,
    modified: new Date(),
    status: "waiting",
    metadata: extendMetadata(metadata, {
      method: "edit",
      prompt,
      name,
      version: "OpenAI",
    }),
  };

  updateGalleryItem(item);
  const imageResult = await openAiEditImage({ image: imageBlob, mask: imageBlob, prompt }, config.value.openApiKey);
  return await handleImageResult(imageResult, item);
}

async function variation({ image, metadata }: VariationOptions) {
  const imageBlob = (await new Promise<Blob | null>((resolve) => image.canvas.toBlob(resolve)))!;
  const name = `variation-${getDatestamp()}.png`;
  const item: Artwork = {
    name,
    modified: new Date(),
    status: "waiting",
    metadata: extendMetadata(metadata, {
      method: "variation",
      name,
      version: "OpenAI",
    }),
  };

  updateGalleryItem(item);
  const imageResult = await openAiImageVariation({ image: imageBlob }, config.value.openApiKey);
  return await handleImageResult(imageResult, item);
}

async function handleImageResult(imageResult: ImageResultError | ImageResultReady, item: Artwork) {
  if (imageResult.status === "error") {
    const errorResult = clone(item) as ArtworkError;
    last(errorResult.metadata.history).error = imageResult.error;
    errorResult.status = imageResult.status;

    errorResult.modified = new Date(errorResult.modified);
    console.log("got error", errorResult);
    updateGalleryItem(errorResult);
    return errorResult;
  }

  const result = clone(item) as ArtworkInMemory;
  last(result.metadata.history).created = imageResult.created.toISOString();
  result.dataUrl = imageResult.dataUrl;
  result.modified = new Date(result.modified);
  const updatedItem = await saveGalleryItem(result);

  updateGalleryItem(updatedItem);
  return updatedItem;
}

export default {
  generate,
  outpaint,
  variation,
  config,
};

usePersistentState("openAiService.config", config);
