//import { cacheFetch } from "./cacheService";
import { googleAuthState } from "./GoogleAuth";

export function escapeQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export const fileInfoKeys = ["id", "name", "modifiedTime"];
export interface FileInfo {
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
  return new Headers({ Authorization: `Bearer ${googleAuthState.value.accessToken}` });
}

export async function googleFileBlob(id: string) {
  const url = googleUrl(id, {
    alt: "media",
  });
  const response = await fetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
    },
    // `/gallery/${id}`
  );
  return await response.blob();
}

export async function googleFileUpdate(id: string, name: string, file: Blob) {
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

export async function googleFileCreate(folderId: string, name: string, file: Blob) {
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

export async function googleFolderCreate(name: string) {
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

export async function googleFileGet(id: string) {
  const url = googleUrl(id, {
    fields: fileInfoKeys.join(","),
  });
  const response = await fetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
    },
    // `/gallery/${id}/metadata`
  );
  return (await response.json()) as FileInfo;
}

export async function googleFileDelete(id: string) {
  const url = googleUrl(id);
  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return response.status === 204;
}

export async function googleFilesGet(params: Record<string, string>) {
  const url = googleUrl(params);
  const response = await fetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
    },
    // TODO purge this file of cache
    // TODO tidy this file
    // cacheKey
  );
  const result = await response.json();
  return result.files as FileInfo[];
}
