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
import { ref, toRaw, watch, watchPostEffect } from "vue";
import { clone } from "@/lib/utils";
// import { parse } from "path-browserify";

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

watch(
  () => clone(progressState.value),
  (state: ProgressState) => {
    messageBus.publish({ name: "updateProgress", params: [state] });
  },
);

async function onLoadBlob(metadata: {
  //
  id: string;
  name: string;
  path: string;
}) {
  //
  console.log("TODO load blob", metadata);
  if (!accessToken) throw "accessToken not set";

  progressState.value = {
    message: "finding folders",
    max: 4,
    value: 1,
  };

  // TODO don't use makePath in this "read" method
  const folders = await makePath(rootDirName + "/" + metadata.path);
  progressState.value.value = 2;

  const folder = folders[folders.length - 1];

  progressState.value.message = "finding file";
  progressState.value.value = 3;

  let file = await getFile(metadata.name, folder.id);

  if (!file) {
    progressState.value.error = "file not found";
    return;
  }

  // TODO when I passed no accessToken I got json back but no exception!?
  const blob = await googleFileBlob(file.id, accessToken);
  console.log('blob here', blob)
  progressState.value.value = 4;
  return blob;
}

async function onSaveBlob(
  blob: Blob,
  metadata: {
    id: string;
    name: string;
    path: string;
  },
) {
  if (!accessToken) throw "accessToken not set";

  progressState.value = {
    message: "finding folders",
    max: 4,
    value: 1,
  };

  const folders = await makePath(rootDirName + "/" + metadata.path);
  progressState.value.value = 2;

  const folder = folders[folders.length - 1];

  progressState.value.message = "finding file";
  progressState.value.value = 3;

  let file = await getFile(metadata.name, folder.id);

  progressState.value.message = "uploading file";
  if (file) file = await googleFileUpdate(file.id, metadata.name, blob, accessToken);
  else file = await googleFileCreate(folder.id, metadata.name, blob, accessToken);

  progressState.value.value = 4;
  return file;
}

console.log("Hello from gallery worker");

async function makePath(path: string) {
  const splitPath = path.split("/").filter((p) => p !== "");

  const foldersInPath = [];
  let folderId: string | undefined;
  for (let i = 0; i < splitPath.length; i++) {
    let folder = await getFolder(splitPath[i], folderId);

    if (!folder) folder = await makeFolder(splitPath[i], folderId);

    folderId = folder?.id;
    foldersInPath.push(folder);
  }

  return foldersInPath;
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
