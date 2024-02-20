//import { cacheFetch } from "./cacheService";
// import { googleAuthState } from "./GoogleAuth";

export function escapeQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export const fileInfoKeys = ["id", "name", "modifiedTime"];
export interface FileInfo {
  id: string;
  name: string;
  modifiedTime: string;
}

function driveFilesUrl(id: string): string;
function driveFilesUrl(params: Record<string, string>): string;
function driveFilesUrl(id: string, params: Record<string, string>): string;
function driveFilesUrl(idOrParams: string | Record<string, string>, params?: Record<string, string>) {
  if (typeof idOrParams === "object") {
    const params = idOrParams;
    return `https://www.googleapis.com/drive/v3/files?${new URLSearchParams(params)}`;
  }
  const id = idOrParams;
  if (params) return `https://www.googleapis.com/drive/v3/files/${id}?${new URLSearchParams(params)}`;
  return `https://www.googleapis.com/drive/v3/files/${id}`;
}

function uploadDriveFilesUrl(id: string): string;
function uploadDriveFilesUrl(params: Record<string, string>): string;
function uploadDriveFilesUrl(id: string, params: Record<string, string>): string;
function uploadDriveFilesUrl(idOrParams: string | Record<string, string>, params?: Record<string, string>) {
  if (typeof idOrParams === "object") {
    const params = idOrParams;
    return `https://www.googleapis.com/upload/drive/v3/files?${new URLSearchParams(params)}`;
  }
  const id = idOrParams;
  if (params) return `https://www.googleapis.com/upload/drive/v3/files/${id}?${new URLSearchParams(params)}`;
  return `https://www.googleapis.com/upload/drive/v3/files/${id}`;
}

function getHeaders(accessToken: string) {
  return new Headers({ Authorization: `Bearer ${accessToken}` });
}

export async function googleFileBlob(id: string, accessToken: string) {
  const url = driveFilesUrl(id, {
    alt: "media",
  });
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(accessToken),
  });
  return await response.blob();
}

export async function googleFileUpdate(id: string, name: string, file: Blob, accessToken: string) {
  const url = uploadDriveFilesUrl(id, {
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
    headers: getHeaders(accessToken),
    body,
  });
  return (await response.json()) as FileInfo;
}

export async function googleFileCreate(folderId: string, name: string, file: Blob, accessToken: string) {
  const url = uploadDriveFilesUrl({
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
    headers: getHeaders(accessToken),
    body,
  });
  return (await response.json()) as FileInfo;
}

export async function googleFolderCreate(name: string, folderId: string | undefined, accessToken: string) {
  const url = driveFilesUrl({
    fields: fileInfoKeys.join(","),
  });
  const body = {
    name,
    parents: [folderId],
    mimeType: "application/vnd.google-apps.folder",
  };
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(accessToken),
    body: JSON.stringify(body),
  });
  return (await response.json()) as FileInfo;
}

// export async function googleFileGet(id: string) {
//   const url = googleUrl(id, {
//     fields: fileInfoKeys.join(","),
//   });
//   const response = await fetch(
//     url,
//     {
//       method: "GET",
//       headers: getHeaders(),
//     },
//     // `/gallery/${id}/metadata`
//   );
//   return (await response.json()) as FileInfo;
// }

// export async function googleFileDelete(id: string) {
//   const url = googleUrl(id);
//   const response = await fetch(url, {
//     method: "DELETE",
//     headers: getHeaders(),
//   });
//   return response.status === 204;
// }

export async function googleFilesGet(params: Record<string, string>, accessToken: string) {
  const url = driveFilesUrl(params);
  const response = await fetch(
    url,
    {
      method: "GET",
      headers: getHeaders(accessToken),
    },
    // TODO purge this file of cache
    // TODO tidy this file
    // cacheKey
  );
  // TODO needed in more places, should I raise exception instead?
  console.assert(response.status === 200, `unexpected status: ${response.status}`);
  const result = await response.json();
  return result.files as FileInfo[];
}
