import { authState } from "@/services/googleAuthService";
import { cacheFetch, cacheFlushKeys } from "@/services/cacheService";

export function escapeQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

const fileInfoKeys = ["id", "name", "modifiedTime"];
interface FileInfo {
  id: string;
  name: string;
  modifiedTime: string;
}

function googleUrl(id: string): string;
function googleUrl(params: Record<string, string>): string;
function googleUrl(id: string, params: Record<string, string>): string;
function googleUrl(idOrParams: string | Record<string, string>, params?: Record<string, string>) {
  if (typeof idOrParams === "object") {
    const params = idOrParams;
    return `https://www.googleapis.com/drive/v3/files?${new URLSearchParams(params)}`;
  }
  const id = idOrParams;
  if (params) return `https://www.googleapis.com/drive/v3/files/${id}?${new URLSearchParams(params)}`;
  return `https://www.googleapis.com/drive/v3/files/${id}`;
}

function googleUploadUrl(id: string): string;
function googleUploadUrl(params: Record<string, string>): string;
function googleUploadUrl(id: string, params: Record<string, string>): string;
function googleUploadUrl(idOrParams: string | Record<string, string>, params?: Record<string, string>) {
  if (typeof idOrParams === "object") {
    const params = idOrParams;
    return `https://www.googleapis.com/upload/drive/v3/files?${new URLSearchParams(params)}`;
  }
  const id = idOrParams;
  if (params) return `https://www.googleapis.com/upload/drive/v3/files/${id}?${new URLSearchParams(params)}`;
  return `https://www.googleapis.com/upload/drive/v3/files/${id}`;
}

function getHeaders() {
  return new Headers({ Authorization: `Bearer ${authState.value.accessToken}` });
}

async function googleFileBlob(id: string) {
  const url = googleUrl(id, {
    alt: "media",
  });
  const response = await cacheFetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
    },
    `/gallery/${id}`
  );
  return await response.blob();
}

async function googleFileUpdate(id: string, name: string, file: Blob) {
  const url = googleUploadUrl(id, {
    uploadType: "multipart",
    fields: fileInfoKeys.join(","),
  });
  const metadata = {
    name,
    mimeType: "image/png",
  };
  const body = new FormData();
  body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  body.append("file", file);
  const response = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body,
  });
  return (await response.json()) as FileInfo;
}

async function googleFileCreate(folderId: string, id: string, name: string, file: Blob) {
  const url = googleUploadUrl({
    uploadType: "multipart",
    fields: fileInfoKeys.join(","),
  });
  const metadata = {
    name,
    mimeType: "image/png",
    parents: [folderId],
  };
  const body = new FormData();
  body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  body.append("file", file);
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body,
  });
  return (await response.json()) as FileInfo;
}

async function googleFolderCreate(name: string) {
  const url = googleUrl({
    fields: fileInfoKeys.join(","),
  });
  const body = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return (await response.json()) as FileInfo;
}

async function googleFileGet(id: string) {
  const url = googleUrl(id, {
    fields: fileInfoKeys.join(","),
  });
  const response = await cacheFetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
    },
    `/gallery/${id}/metadata`
  );
  return (await response.json()) as FileInfo;
}

async function googleFileDelete(id: string) {
  const url = googleUrl(id);
  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return response.status === 204;
}

async function googleFilesGet(params: Record<string, string>, cacheKey: string) {
  const url = googleUrl(params);
  const response = await cacheFetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
    },
    cacheKey
  );
  const result = await response.json();
  return result.files as FileInfo[];
}

const rootDirName = "gallery.challen.info"; // TODO hard coded folder name?

export async function folderExists(name: string) {
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

export async function createFolder(name: string) {
  return await googleFolderCreate(name);
}

export async function ensureFolder(name: string) {
  let folder = await folderExists(name);
  if (!folder) folder = await createFolder(name);
  return folder;
}

export async function listFiles() {
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

export async function getFileBlob(id: string) {
  return await googleFileBlob(id);
}

export async function getFile(id: string) {
  return await googleFileGet(id);
}

export async function deleteFile(id: string) {
  await cacheFlushKeys([`/gallery/${id}`, `/gallery/${id}/metadata`, "/gallery"]);
  return googleFileDelete(id);
}

export async function saveFile(id: string, name: string, file: Blob) {
  const folder = await ensureFolder(rootDirName);
  if (id) {
    await cacheFlushKeys([`/gallery/${id}`, `/gallery/${id}/metadata`]);
    return await googleFileUpdate(id, name, file);
  }
  await cacheFlushKeys([`/gallery`]);
  return await googleFileCreate(folder.id, id, name, file);
}
