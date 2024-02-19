import {
  escapeQuery,
  googleFilesGet,
  type FileInfo,
  fileInfoKeys,
  googleFolderCreate,
  googleFileUpdate,
  googleFileCreate,
  googleFileBlob,
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
  const folders = await readPath(rootDirName + "/" + artwork.path);
  const folder = folders[folders.length - 1];
  if (!folder) return notifyError("folder not found");

  notifyProgress("finding file");
  const file = await getFile(artwork.name, folder.id);
  if (!file) return notifyError("file not found");

  notifyProgress("loading file");
  // TODO when I passed no accessToken I got json back but no exception!?
  const blob = await googleFileBlob(file.id, accessToken);

  notifyProgress("file loaded");
  return blob;
}

async function onSaveBlob(artwork: ArtworkWithBlob) {
  if (!accessToken) throw "accessToken not set";

  notifyProgress("finding folders", 4);
  const folders = await makePath(rootDirName + "/" + artwork.path);
  const folder = folders[folders.length - 1];

  notifyProgress("finding file");
  let file = await getFile(artwork.name, folder.id);

  notifyProgress("saving file");
  if (file) file = await googleFileUpdate(file.id, artwork.name, artwork.blob, accessToken);
  else file = await googleFileCreate(folder.id, artwork.name, artwork.blob, accessToken);

  notifyProgress("file saved");
  return file;
}

async function makePath(path: string, readonly: boolean = false) {
  const splitPath = path.split("/").filter((p) => p !== "");

  const foldersInPath = [];
  let folderId: string | undefined;
  for (let i = 0; i < splitPath.length; i++) {
    let folder = await getFolder(splitPath[i], folderId);

    if (!folder && !readonly) folder = await makeFolder(splitPath[i], folderId);

    folderId = folder?.id;
    foldersInPath.push(folder);
    if (!folder) return foldersInPath;
  }

  return foldersInPath;
}

async function readPath(path: string) {
  return makePath(path, true);
}

async function getFolder(name: string, folderId?: string): Promise<FileInfo | undefined> {
  if (!accessToken) throw "accessToken not set";
  const parentsClause = folderId ? ` and '${escapeQuery(folderId)}' in parents ` : "";
  const result = await googleFilesGet(
    {
      q: `trashed=false and name='${escapeQuery(name)}' and mimeType='application/vnd.google-apps.folder' ${parentsClause}`,
      pageSize: "1",
      fields: `files(${fileInfoKeys.join(",")})`,
    },
    accessToken,
  );
  return result[0];
}

export async function makeFolder(name: string, folderId?: string): Promise<FileInfo> {
  if (!accessToken) throw "accessToken not set";
  let folder = await getFolder(name, folderId);
  if (!folder) folder = await googleFolderCreate(name, folderId, accessToken);
  return folder;
}

async function getFile(name: string, folderId: string): Promise<FileInfo | undefined> {
  if (!accessToken) throw "accessToken not set";
  return (
    await googleFilesGet(
      {
        q: `trashed=false and '${escapeQuery(folderId)}' in parents and name='${escapeQuery(name)}'`,
        fields: `nextPageToken, files(${fileInfoKeys.join(",")})`,
      },
      accessToken,
    )
  )[0];
}
