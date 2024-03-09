import {
  googleFileUpdate,
  googleFileCreate,
  googleFileGetBlob,
  googleFileGet,
  googleFilesGet,
  googleFileDelete,
  googleFolderGet,
  googleFolderGetOrCreate,
} from "@/lib/Google/GoogleApi";
import { createMessageBus } from "@/lib/MessageBus";
import type { Artwork, ArtworkWithBlob } from "./Artwork";
import { notifyToast } from "../Notify/notifyState";
import { cacheDelete, cacheGet, cachePut } from "./cacheService";

export const messageBus = createMessageBus(() => self);
messageBus.subscribe("saveBlob", onSaveBlob);
messageBus.subscribe("loadBlob", onLoadBlob);
messageBus.subscribe("setAccessToken", onSetAccessToken);
messageBus.subscribe("loadGallery", onLoadGallery);
messageBus.subscribe("deleteArtwork", onDeleteGallery);

let accessToken: string | undefined;

const rootDirName = "gallery.challen.info/v2";
async function onSetAccessToken(newAccessToken: string) {
  notifyToast("onSetAccessToken len:" + accessToken?.length);

  // TODO something may still be wrong, tokens automatically, leave this console.log here for now
  // since saying that ot may be better, still leaving it here though
  console.log("onSetAccessToken", (newAccessToken || "").substring(0, 6) + "...");
  accessToken = newAccessToken;
}

const notifyError = (error: string) => messageBus.publish("notifyError", [error]);
const notifyProgress = (message: string, steps?: number) => messageBus.publish("notifyProgress", [message, steps]);

async function onLoadBlob(artwork: Artwork) {
  if (!accessToken) throw "accessToken not set";

  const cacheBlob = await cacheGet(artwork.path, artwork.name);
  if (cacheBlob) return cacheBlob;

  notifyProgress("finding folders", 3);
  const folders = await googlePathGet(rootDirName + "/" + artwork.path, accessToken);
  const folder = folders[folders.length - 1];
  if (!folder) return notifyError("folder not found");

  notifyProgress("finding file");
  const file = await googleFileGet(artwork.name, folder.id, accessToken);
  if (!file) return notifyError("file not found");

  notifyProgress("loading file");
  const blob = await googleFileGetBlob(file.id, accessToken);

  notifyProgress("file loaded");
  return blob;
}

async function onSaveBlob(artwork: ArtworkWithBlob): Promise<Artwork | void> {
  if (!accessToken) throw "accessToken not set";

  cachePut(artwork.path, artwork.name, artwork.blob);
  notifyProgress("finding folders", 4);
  const folders = await pathGetOrCreate(rootDirName + "/" + artwork.path, false);
  const folder = folders[folders.length - 1];
  if (!folder) return notifyError("folder not found");

  notifyProgress("finding file");
  let file = await googleFileGet(artwork.name, folder.id, accessToken);

  notifyProgress("saving file");
  if (file) file = await googleFileUpdate(file.id, artwork.name, artwork.blob, accessToken);
  else file = await googleFileCreate(folder.id, artwork.name, artwork.blob, accessToken);

  // TODO I could use my own data instead of getting their thumbnail, the thumbnail is not generated instantly anyway
  notifyProgress("get file");
  const savedFile = await googleFileGet(file.name, folder.id, accessToken);
  // console.log(savedFile);
  notifyProgress("file saved");
  if (!savedFile) return;
  return {
    id: savedFile.id,
    name: savedFile.name,
    createdTime: new Date(savedFile.createdTime),
    modifiedTime: new Date(savedFile.modifiedTime),
    thumbnailUrl: savedFile.thumbnailLink,
  };
}

async function onDeleteGallery(artwork: Artwork) {
  if (!accessToken) throw "accessToken not set";

  await cacheDelete(artwork.path, artwork.name);

  notifyProgress("finding folders", 3);
  const folders = await pathGetOrCreate(rootDirName + "/" + artwork.path, true);
  const folder = folders[folders.length - 1];
  if (!folder) return notifyError("folder not found");

  notifyProgress("finding file");
  const file = await googleFileGet(artwork.name, folder.id, accessToken);
  if (file) {
    notifyProgress("deleting file");
    await googleFileDelete(file.id, accessToken);
    notifyProgress("deleted");
  } else {
    notifyProgress("file did not exist", -2);
  }
}

async function onLoadGallery(path: string): Promise<Artwork[] | void> {
  if (!accessToken) throw "accessToken not set";

  notifyProgress("finding folders", 2);
  const folders = await pathGetOrCreate(rootDirName + "/" + path, true);
  // const folders = await googlePathGet(rootDirName + "/" + path, accessToken);
  //const folders = await googlePathGet(rootDirName + "/" + path, accessToken);
  // console.log(folders);
  const folder = folders[folders.length - 1];
  if (!folder) return notifyError("folder not found");

  notifyProgress("finding files");
  const files = await googleFilesGet(folder.id, accessToken);

  notifyProgress("files loaded");
  return files.map(
    (file) =>
      ({
        id: file.id,
        name: file.name,
        createdTime: new Date(file.createdTime),
        modifiedTime: new Date(file.modifiedTime),
        thumbnailUrl: file.thumbnailLink,
      }) as Artwork,
  );
}

async function pathGetOrCreate(path: string, readonly: boolean) {
  if (!accessToken) throw "accessToken not set";
  const splitPath = path.split("/").filter((p) => p !== "");

  const foldersInPath = [];
  let folderId: string | undefined;
  for (let i = 0; i < splitPath.length; i++) {
    const folder = readonly ? await googleFolderGet(splitPath[i], folderId, accessToken) : await googleFolderGetOrCreate(splitPath[i], folderId, accessToken);
    folderId = folder?.id;
    foldersInPath.push(folder);
    if (!folder) return foldersInPath;
  }

  return foldersInPath;
}
