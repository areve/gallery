import { googleFileUpdate, googleFileCreate, googleFileBlob, googlePathGetOrCreate, googleFileGet, googlePathGet } from "@/lib/Google/GoogleApi";
import { createMessageBus } from "@/lib/MessageBus";
import type { Artwork, ArtworkWithBlob } from "./Artwork";

export const messageBus = createMessageBus(() => self);
messageBus.subscribe("saveBlob", onSaveBlob);
messageBus.subscribe("loadBlob", onLoadBlob);
messageBus.subscribe("setAccessToken", onSetAccessToken);

let accessToken: string | undefined;

const rootDirName = "gallery.challen.info/v2";
async function onSetAccessToken(newAccessToken: string) {
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
  const blob = await googleFileBlob(file.id, accessToken);

  notifyProgress("file loaded");
  return blob;
}

async function onSaveBlob(artwork: ArtworkWithBlob) {
  if (!accessToken) throw "accessToken not set";

  notifyProgress("finding folders", 3);
  const folders = await googlePathGetOrCreate(rootDirName + "/" + artwork.path, accessToken);
  const folder = folders[folders.length - 1];
  if (!folder) return notifyError("folder not found");

  notifyProgress("finding file");
  let file = await googleFileGet(artwork.name, folder.id, accessToken);

  notifyProgress("saving file");
  if (file) file = await googleFileUpdate(file.id, artwork.name, artwork.blob, accessToken);
  else file = await googleFileCreate(folder.id, artwork.name, artwork.blob, accessToken);

  notifyProgress("file saved");
  return file;
}
