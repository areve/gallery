import type {
  ArtworkDeleted,
  ArtworkOnCanvas,
  ArtworkError,
  ArtworkInMemory,
  Artwork,
  ArtworkImage,
  ArtworkWithDatesAsIso,
} from "@/interfaces/Artwork";
import { clone, findErrorMessage, loadImage } from "@/lib/utils";
import axios, { type AxiosResponse } from "axios";

async function saveGalleryItem(item: ArtworkOnCanvas | ArtworkInMemory) {
  let response: AxiosResponse<ArtworkWithDatesAsIso>;
  try {
    response = await axios.post<ArtworkWithDatesAsIso>(
      "/api/editor/saveImage",
      {
        image:
          (item as ArtworkInMemory).dataUrl ||
          (item as ArtworkOnCanvas).context.canvas.toDataURL(),
        filename: item.filename,
        metadata: item.metadata,
      }
    );
  } catch (e) {
    const result: ArtworkError = {
      status: "error",
      modified: new Date(),
      filename: item.filename,
      metadata: item.metadata,
      error: findErrorMessage(e),
    };
    return result;
  }

  return Object.assign(clone(response.data), {
    modified: new Date(response.data.modified),
  });
}

async function getGallery(): Promise<Artwork[]> {
  let response: AxiosResponse<ArtworkWithDatesAsIso[]>;
  try {
    response = await axios.get<ArtworkWithDatesAsIso[]>("/api/gallery/");
  } catch (e) {
    console.error(e);
    return [] as Artwork[];
  }

  return response.data.map((x) =>
    Object.assign(clone(x), {
      modified: new Date(x.modified),
    })
  );
}

async function getGalleryItem(filename: string): Promise<ArtworkImage> {
  const imagePromise = loadImage(
    `/downloads/${filename}?${new Date().toISOString()}`
  );
  const artworkResponsePromise = axios.get<ArtworkWithDatesAsIso>(
    `/api/gallery/${filename}`
  );
  const [image, artworkResponse] = await Promise.all([
    imagePromise,
    artworkResponsePromise,
  ]);
  const artwork = artworkResponse.data;
  const result = clone(artwork) as any as ArtworkImage;
  result.image = image;
  result.modified = new Date(result.modified);
  return result;
}

async function deleteGalleryItem(filename: string) {
  const result: ArtworkDeleted = {
    status: "deleted",
    filename,
    modified: new Date(),
    metadata: { history: [] },
  };
  try {
    await axios.post("/api/editor/deleteImage", {
      filename,
    });
  } catch (e) {
    const error: ArtworkError = {
      status: "error",
      modified: new Date(),
      error: findErrorMessage(e),
      filename,
      metadata: result.metadata,
    };
    return error;
  }
  return result;
}

export default {
  saveGalleryItem,
  getGallery,
  getGalleryItem,
  deleteGalleryItem,
};
