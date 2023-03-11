import { readMetadata } from "@/services/pngMetadataService";
import type { ArtworkDeleted, ArtworkOnCanvas, ArtworkError, ArtworkInMemory, Artwork, ArtworkImage, ArtworkWithDatesAsIso } from "@/interfaces/Artwork";
import { clone, findErrorMessage, loadImage } from "@/lib/utils";
import axios, { type AxiosResponse } from "axios";
import { deleteFile, getBytes, getFile, listFiles, saveFile } from "./googleApi";
import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata";

async function dataUrlToBlob(dataUrl: string) {
  const res = await fetch(dataUrl);
  return res.blob();
}

function metadataToArtworkMetadata(metadata: any) {
  // TODO could also support old style metadata here (filename to name and id, etc)
  return Object.assign({ history: [] }, clone(metadata)) as ArtworkMetadata;
}

const useGoogleDrive = true;
async function saveGalleryItem(item: ArtworkOnCanvas | ArtworkInMemory) {
  if (useGoogleDrive) {
    const imageBlob = (item as ArtworkInMemory).dataUrl
      ? await dataUrlToBlob((item as ArtworkInMemory).dataUrl)
      : (await new Promise<Blob | null>((resolve) => (item as ArtworkOnCanvas).context.canvas.toBlob(resolve)))!;
    // TODO setMetadata in imageBlob 
    const file = await saveFile(item.name, imageBlob);
    return {
      id: file.id,
      name: file.name,
      status: "ready",
      metadata: item.metadata,
      //image,
      modified: new Date(file.modifiedTime),
    };
  } else {
    let response: AxiosResponse<ArtworkWithDatesAsIso>;
    try {
      response = await axios.post<ArtworkWithDatesAsIso>("/api/editor/saveImage", {
        image: (item as ArtworkInMemory).dataUrl || (item as ArtworkOnCanvas).context.canvas.toDataURL(),
        name: item.name,
        id: item.name,
        metadata: item.metadata,
      });
    } catch (e) {
      const result: ArtworkError = {
        status: "error",
        modified: new Date(),
        name: item.name,
        id: item.name,
        metadata: item.metadata,
        error: findErrorMessage(e),
      };
      return result;
    }

    return Object.assign(clone(response.data), {
      modified: new Date(response.data.modified),
    });
  }
}

function bytesToDataUrl(bytes: string) {
  return "data:image/png;base64," + btoa(bytes);
}
async function getGallery(): Promise<Artwork[]> {
  if (useGoogleDrive) {
    const files = await listFiles();
    const result = await Promise.all(
      files.map(async (x: any) => {
        const png = await getBytes(x.id);
        return {
          id: x.id,
          name: x.name,
          status: "ready",
          metadata: metadataToArtworkMetadata(readMetadata(png)),
          dataUrl: bytesToDataUrl(png),
          image: null! as HTMLImageElement,
          modified: new Date(x.modifiedTime),
        } as ArtworkImage;
      })
    );
    console.log(result);
    return result;
  } else {
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
}

async function getGalleryItem(id: string): Promise<ArtworkImage> {
  if (useGoogleDrive) {
    const pngPromise = getBytes(id);
    const filePromise = getFile(id);
    const imagePromise = pngPromise.then((png: any) => loadImage(bytesToDataUrl(png)));
    const metadataPromise = pngPromise.then((png: any) => metadataToArtworkMetadata(readMetadata(png)));
    const [image, file, metadata] = await Promise.all([imagePromise, filePromise, metadataPromise]);
    return {
      id: file.id,
      name: file.name,
      status: "ready",
      metadata,
      image,
      modified: new Date(file.modifiedTime),
    };
  } else {
    const imagePromise = loadImage(`/downloads/${id}?${new Date().toISOString()}`);
    const artworkResponsePromise = axios.get<ArtworkWithDatesAsIso>(`/api/gallery/${id}`);
    const [image, artworkResponse] = await Promise.all([imagePromise, artworkResponsePromise]);
    const artwork = artworkResponse.data;
    const result = clone(artwork) as any as ArtworkImage;
    result.image = image;
    result.modified = new Date(result.modified);
    return result;
  }
}

async function deleteGalleryItem(id: string) {
  const result: ArtworkDeleted = {
    status: "deleted",
    id,
    modified: new Date(),
    metadata: { history: [] },
  };

  if (useGoogleDrive) {
    await deleteFile(id);
    return result;
  } else {
    try {
      await axios.post("/api/editor/deleteImage", {
        id,
      });
    } catch (e) {
      const error: ArtworkError = {
        status: "error",
        modified: new Date(),
        error: findErrorMessage(e),
        id: id,
        name: "", // TODO bad name?
        metadata: result.metadata,
      };
      return error;
    }
    return result;
  }
}

export default {
  saveGalleryItem,
  getGallery,
  getGalleryItem,
  deleteGalleryItem,
};
