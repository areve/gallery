import { readMetadata, setMetadata } from "@/services/pngMetadataService";
import type { ArtworkDeleted, ArtworkOnCanvas, ArtworkInMemory, Artwork, ArtworkImage } from "@/interfaces/Artwork";
import { clone, loadImage } from "@/lib/utils";
import {
  escapeQuery,
  googleFileBlob,
  googleFileCreate,
  googleFileDelete,
  googleFileGet,
  googleFilesGet,
  googleFileUpdate,
  googleFolderCreate,
  fileInfoKeys,
  type FileInfo,
} from "./googleApi";
import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata";
import { cacheFlushKeys } from "@/services/cacheService";

const rootDirName = "gallery.challen.info"; // TODO hard coded folder name?

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
  //const png = await googleFileBlob(x.id);
  // console.log(item.metadata)
  // throw "whatever"
  const file = await saveFile(item.id, item.name, imageBlob2);
  return <Artwork>{
    id: file.id,
    name: file.name,
    status: "ready",
    metadata: item.metadata,
    dataUrl: await blobToDataURL(imageBlob2),
    modified: new Date(file.modifiedTime),
  };
}

async function saveFile(id: string, name: string, file: Blob) {
  const folder = await ensureFolder(rootDirName);
  if (id) {
    await cacheFlushKeys([`/gallery/${id}`, `/gallery/${id}/metadata`]);
    return await googleFileUpdate(id, name, file);
  }
  await cacheFlushKeys([`/gallery`]);
  return await googleFileCreate(folder.id, id, name, file);
}

async function loadSrc(item: Artwork) {
  const result = clone(item);
  const png = await googleFileBlob(item.id);
  result.src = URL.createObjectURL(png);
  return result;
}

async function getGallery(): Promise<Artwork[]> {
  const files = await listFiles();
  // TODO shouldn't have to await all these
  const result = files.map((x: FileInfo) => {
    // const png = await googleFileBlob(x.id);
    return {
      id: x.id,
      name: x.name,
      status: "ready",
      //metadata: metadataToArtworkMetadata(await readMetadata(png)),
      //dataUrl: await blobToDataURL(png),
      src: undefined,
      image: null! as HTMLImageElement,
      modified: new Date(x.modifiedTime),
    } as Artwork;
  });
  return result;
}

async function getGalleryItem(id: string): Promise<ArtworkImage> {
  const pngPromise = googleFileBlob(id);
  const filePromise = googleFileGet(id);
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
    id,
    modified: new Date(),
    metadata: { history: [] },
  };

  await cacheFlushKeys([`/gallery/${id}`, `/gallery/${id}/metadata`, "/gallery"]);
  await googleFileDelete(id);
  return result;
}

interface GalleryAdapter {
  saveGalleryItem: (item: ArtworkOnCanvas | ArtworkInMemory) => Promise<Artwork>;
  getGallery: () => Promise<Artwork[]>;
  loadSrc: (item: Artwork) => Promise<Artwork>;
  getGalleryItem: (id: string) => Promise<ArtworkImage>;
  deleteGalleryItem: (id: string) => Promise<ArtworkDeleted>;
}

export default <GalleryAdapter>{
  saveGalleryItem,
  getGallery,
  loadSrc,
  getGalleryItem,
  deleteGalleryItem,
};

async function folderExists(name: string) {
  const result = await googleFilesGet(
    {
      q: `trashed=false and name='${escapeQuery(name)}' and mimeType='application/vnd.google-apps.folder'`,
      pageSize: "1",
      fields: `files(${fileInfoKeys.join(",")})`,
    },
    "/"
  );
  return result[0];
}

async function ensureFolder(name: string) {
  let folder = await folderExists(name);
  if (!folder) folder = await googleFolderCreate(name);
  return folder;
}

async function listFiles() {
  const folder = await ensureFolder(rootDirName);
  return await googleFilesGet(
    {
      q: `trashed=false and '${escapeQuery(folder.id)}' in parents`,
      // TODO support "pageSize"
      fields: `nextPageToken, files(${fileInfoKeys.join(",")})`,
    },
    "/gallery"
  );
}
