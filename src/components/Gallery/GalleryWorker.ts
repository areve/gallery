import {
  googleFileUpdate,
  googleFileCreate,
  googleFileGetBlob,
  googlePathGetOrCreate,
  googleFileGet,
  googlePathGet,
  googleFilesGet,
  googleFileDelete,
} from "@/lib/Google/GoogleApi";
import { createMessageBus } from "@/lib/MessageBus";
import type { Artwork, ArtworkWithBlob } from "./Artwork";
import { notifyToast } from "../Notify/notifyState";

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

async function onSaveBlob(artwork: ArtworkWithBlob) {
  if (!accessToken) throw "accessToken not set";

  notifyProgress("finding folders", 4);
  const folders = await googlePathGetOrCreate(rootDirName + "/" + artwork.path, accessToken);
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
  console.log(savedFile);
  notifyProgress("file saved");
  return savedFile;
}

async function onDeleteGallery(artwork: Artwork) {
  if (!accessToken) throw "accessToken not set";
  notifyProgress("finding folders", 3);
  const folders = await googlePathGet(rootDirName + "/" + artwork.path, accessToken);
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
  const folders = await googlePathGet(rootDirName + "/" + path, accessToken);
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
