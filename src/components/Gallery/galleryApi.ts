import { readMetadata, setMetadata } from "@/services/pngMetadataService";
import type { ArtworkDeleted, ArtworkOnCanvas, ArtworkInMemory, Artwork, ArtworkImage } from "@/interfaces/Artwork";
import { clone, loadImage } from "@/lib/utils";
import { deleteFile, getFileBlob, getFile, listFiles, saveFile } from "./googleApi";
import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata";

async function dataUrlToBlob(dataUrl: string) {
  const res = await fetch(dataUrl);
  return res.blob();
}

function metadataToArtworkMetadata(metadata: any) {
  // TODO could also support old style metadata here (filename to name and id, etc)
  return Object.assign({ history: [] }, clone(metadata)) as ArtworkMetadata;
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (_e) => resolve(reader.result as string);
    reader.onerror = (_e) => reject(reader.error);
    reader.onabort = (_e) => reject(new Error("Read aborted"));
    reader.readAsDataURL(blob);
  });
}

async function saveGalleryItem(item: ArtworkOnCanvas | ArtworkInMemory) {
  const imageBlob = (item as ArtworkInMemory).dataUrl
    ? await dataUrlToBlob((item as ArtworkInMemory).dataUrl)
    : (await new Promise<Blob | null>((resolve) => (item as ArtworkOnCanvas).context.canvas.toBlob(resolve)))!;
  // TODO setMetadata in imageBlob
  // ...
  const imageBlob2 = await setMetadata(imageBlob, item.metadata as any);
  //const png = await getFileBlob(x.id);
  // console.log(item.metadata)
  // throw "whatever"
  const file = await saveFile(item.id, item.name, imageBlob2);
  return {
    id: file.id,
    name: file.name,
    status: "ready",
    metadata: item.metadata,
    dataUrl: await blobToDataURL(imageBlob2),
    modified: new Date(file.modifiedTime),
  };
}

async function getGallery(): Promise<Artwork[]> {
  const files = await listFiles();
  const result = await Promise.all(
    files.map(async (x: any) => {
      const png = await getFileBlob(x.id);
      return {
        id: x.id,
        name: x.name,
        status: "ready",
        metadata: metadataToArtworkMetadata(await readMetadata(png)),
        dataUrl: await blobToDataURL(png),
        image: null! as HTMLImageElement,
        modified: new Date(x.modifiedTime),
      } as ArtworkImage;
    })
  );
  console.log(result);
  return result;
}

async function getGalleryItem(id: string): Promise<ArtworkImage> {
  const pngPromise = getFileBlob(id);
  const filePromise = getFile(id);
  const imagePromise = pngPromise.then((png: Blob) => loadImage(png));
  const metadataPromise = pngPromise.then(async (png: any) => metadataToArtworkMetadata(await readMetadata(png)));
  const [image, file, metadata] = await Promise.all([imagePromise, filePromise, metadataPromise]);
  return {
    id: file.id,
    name: file.name,
    status: "ready",
    metadata,
    image,
    modified: new Date(file.modifiedTime),
  };
}

async function deleteGalleryItem(id: string) {
  const result: ArtworkDeleted = {
    status: "deleted",
    name: "",
    id,
    modified: new Date(),
    metadata: { history: [] },
  };

  await deleteFile(id);
  return result;
}

export default {
  saveGalleryItem,
  getGallery,
  getGalleryItem,
  deleteGalleryItem,
};
