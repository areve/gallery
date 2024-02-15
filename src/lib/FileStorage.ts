import {
  escapeQuery,
  fileInfoKeys,
  googleFilesGet,
  googleFolderCreate,
  type FileInfo,
  googleFileCreate,
  googleFileUpdate,
  googleFileBlob,
} from "./google_/googleApi";
import { parse } from "path-browserify";

export async function readFile(filePath: string) {
  const { dir: folderPath, base: fileName } = parse(filePath);
  const folder = await getDir(folderPath);
  if (!folder) return;
  const file = await getFile(folder.id, fileName);
  if (!file) return;
  return googleFileBlob(file.id);
}

export async function writeFile(filePath: string, blob: Blob): Promise<FileInfo> {
  const { dir: folderPath, base: fileName } = parse(filePath);
  const folder = await mkDir(folderPath);
  const file = await getFile(folder.id, fileName);
  if (file) return await googleFileUpdate(file.id, fileName, blob);
  return await googleFileCreate(folder.id, fileName, blob);
}

export async function mkDir(folderPath: string): Promise<FileInfo> {
  let folder = await getDir(folderPath);
  if (!folder) folder = await googleFolderCreate(folderPath);
  return folder;
}

export async function readDir(name: string): Promise<FileInfo[] | undefined> {
  const folder = await getDir(name);
  if (!folder) return undefined;
  const files = await googleFilesGet({
    q: `trashed=false and '${escapeQuery(folder.id)}' in parents`,
    // TODO support "pageSize"
    fields: `nextPageToken, files(${fileInfoKeys.join(",")})`,
  });
  return files;
}

async function getDir(name: string): Promise<FileInfo | undefined> {
  const result = await googleFilesGet({
    q: `trashed=false and name='${escapeQuery(name)}' and mimeType='application/vnd.google-apps.folder'`,
    pageSize: "1",
    fields: `files(${fileInfoKeys.join(",")})`,
  });
  return result[0];
}

async function getFile(folderId: string, fileName: string): Promise<FileInfo | undefined> {
  return (
    await googleFilesGet({
      q: `trashed=false and '${escapeQuery(folderId)}' in parents and name='${escapeQuery(fileName)}'`,
      fields: `nextPageToken, files(${fileInfoKeys.join(",")})`,
    })
  )[0];
}
