import { googleFileUpdate, googleFileCreate, googleFileBlob, googlePathGetOrCreate, googleFileGet, googlePathGet } from "@/lib/Google/GoogleApi";
import { createMessageBus } from "@/lib/MessageBus";
import { progressError, progressMessage, progressState } from "../Progress/progressState";
import { watchPostEffect } from "vue";
import { clone } from "@/lib/utils";
import type { Artwork, ArtworkWithBlob } from "./Artwork";

export const messageBus = createMessageBus(() => self);
messageBus.subscribe("saveBlob", onSaveBlob);
messageBus.subscribe("loadBlob", onLoadBlob);
messageBus.subscribe("setAccessToken", onSetAccessToken);

let accessToken: string | undefined;

const rootDirName = "gallery.challen.info/v2";
async function onSetAccessToken(newAccessToken: string) {
  // TODO something may still be wrong, tokens automatically, leave this console.log here for now
  // TODO it might be that the first token fetched after a wake up is not valid, the second one I fetched was
  console.log("onSetAccessToken", (newAccessToken || "").substring(0, 6) + "...");
  accessToken = newAccessToken;
}

watchPostEffect(() =>
  messageBus.publish({
    name: "updateProgress",
    params: [clone(progressState.value)],
  }),
);

async function onLoadBlob(artwork: Artwork) {
  if (!accessToken) throw "accessToken not set";

  progressMessage("finding folders", 4);
  const folders = await googlePathGet(rootDirName + "/" + artwork.path, accessToken);
  const folder = folders[folders.length - 1];
  if (!folder) return progressError("folder not found");

  progressMessage("finding file");
  const file = await googleFileGet(artwork.name, folder.id, accessToken);
  if (!file) return progressError("file not found");

  progressMessage("loading file");
  const blob = await googleFileBlob(file.id, accessToken);

  progressMessage("file loaded");
  return blob;
}

async function onSaveBlob(artwork: ArtworkWithBlob) {
  if (!accessToken) throw "accessToken not set";

  progressMessage("finding folders", 4);
  const folders = await googlePathGetOrCreate(rootDirName + "/" + artwork.path, accessToken);
  const folder = folders[folders.length - 1];
  if (!folder) return progressError("folder not found");

  progressMessage("finding file");
  let file = await googleFileGet(artwork.name, folder.id, accessToken);

  progressMessage("saving file");
  if (file) file = await googleFileUpdate(file.id, artwork.name, artwork.blob, accessToken);
  else file = await googleFileCreate(folder.id, artwork.name, artwork.blob, accessToken);

  progressMessage("file saved");
  return file;
}
