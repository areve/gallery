import { clone, getDatestamp, last } from "@/lib/utils";
import { extendMetadata } from "@/lib/artwork-utils";
import { imageCountEmptyPixels } from "@/lib/canvas-utils";
import {
  openAiEditImage,
  openAiGenerateImage,
  openAiImageVariation,
} from "@/services/openAiApi";
import { ref } from "vue";
import { saveGalleryItem, updateGalleryItem } from "./galleryService";
import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata";
import type {
  Artwork,
  ArtworkError,
  ArtworkInMemory,
} from "@/interfaces/Artwork";
import type {
  ImageResultError,
  ImageResultReady,
} from "@/interfaces/OpenAiResponse";

const openApiKey = ref<string>("");

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

  const filename = `generation-${getDatestamp()}.png`;
  const item: Artwork = {
    filename,
    status: "waiting",
    modified: new Date(),
    metadata: {
      history: [
        {
          method: "generation",
          prompt,
          filename,
          version: "OpenAI",
        },
      ],
    },
  };

  updateGalleryItem(item);
  const imageResult = await openAiGenerateImage({ prompt }, openApiKey.value);
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

  const imageBlob = (await new Promise<Blob | null>((resolve) =>
    image.canvas.toBlob(resolve)
  ))!;
  const filename = `outpaint-${getDatestamp()}.png`;
  const item: Artwork = {
    filename,
    modified: new Date(),
    status: "waiting",
    metadata: extendMetadata(metadata, {
      method: "edit",
      prompt,
      filename,
      version: "OpenAI",
    }),
  };

  updateGalleryItem(item);
  const imageResult = await openAiEditImage(
    { image: imageBlob, mask: imageBlob, prompt },
    openApiKey.value
  );
  return await handleImageResult(imageResult, item);
}

async function variation({ image, metadata }: VariationOptions) {
  const imageBlob = (await new Promise<Blob | null>((resolve) =>
    image.canvas.toBlob(resolve)
  ))!;
  const filename = `variation-${getDatestamp()}.png`;
  const item: Artwork = {
    filename,
    modified: new Date(),
    status: "waiting",
    metadata: extendMetadata(metadata, {
      method: "variation",
      filename,
      version: "OpenAI",
    }),
  };

  updateGalleryItem(item);
  const imageResult = await openAiImageVariation(
    { image: imageBlob },
    openApiKey.value
  );
  return await handleImageResult(imageResult, item);
}

async function handleImageResult(
  imageResult: ImageResultError | ImageResultReady,
  item: Artwork
) {
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
  openApiKey,
};
