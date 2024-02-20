import {
  escapeQuery,
  googleFilesGet,
  type FileInfo,
  fileInfoKeys,
  googleFolderCreate,
  googleFileUpdate,
  googleFileCreate,
  googleFileBlob,
  googleFolderGet,
  googlePathGetOrCreate,
  googleFileGet,
  googlePathGet,
} from "@/lib/Google/GoogleApi";
import { createMessageBus } from "@/lib/MessageBus";
import type { ProgressState } from "../Progress/progressState";
import { ref, watchPostEffect } from "vue";
import { clone } from "@/lib/utils";
import type { Artwork, ArtworkWithBlob } from "./Artwork";

export const messageBus = createMessageBus(() => self);
messageBus.subscribe("saveBlob", onSaveBlob);
messageBus.subscribe("loadBlob", onLoadBlob);
messageBus.subscribe("setAccessToken", onSetAccessToken);

let accessToken: string | undefined;

const rootDirName = "gallery.challen.info/v2";
async function onSetAccessToken(newAccessToken: string) {
  accessToken = newAccessToken;
}

const progressState = ref<ProgressState>({
  message: undefined,
  error: undefined,
  max: 0,
  value: 0,
});

watchPostEffect(() => messageBus.publish({ name: "updateProgress", params: [clone(progressState.value)] }));

function notifyError(message: string) {
  progressState.value.error = message;
}

function notifyProgress(message: string, remaining?: number) {
  if (typeof remaining === "number") {
    progressState.value.error = undefined;
    progressState.value.value = 0;
    progressState.value.max = remaining;
  }

  progressState.value.value++;
  progressState.value.message = message;
}

async function onLoadBlob(artwork: Artwork) {
  if (!accessToken) throw "accessToken not set";

  notifyProgress("finding folders", 4);
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

  notifyProgress("finding folders", 4);
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
