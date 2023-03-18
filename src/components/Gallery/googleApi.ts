import { authState } from "@/services/googleAuthService";
import { cacheFetch, cacheFlush } from "@/services/cacheService";

export function escapeQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

const fileInfoKeys = ["id", "name", "modifiedTime"];
interface FileInfo {
  id: string;
  name: string;
  modifiedTime: string; // TODO is this a string?
}

// TODO is there a better way in typescipt to handle method signatures?
function googleUrl(id: string | Record<string, string>, params?: Record<string, string>) {
  if (typeof id === "object") return `https://www.googleapis.com/drive/v3/files?${new URLSearchParams(id)}`;
  if (params) return `https://www.googleapis.com/drive/v3/files/${id}?${new URLSearchParams(params)}`;
  return `https://www.googleapis.com/drive/v3/files/${id}`;
}

function getHeaders() {
  return new Headers({ Authorization: `Bearer ${authState.value.accessToken}` });
}

async function googleFileBlob(id: string) {
  const url = googleUrl(id, {
    alt: "media",
  });
  const response = await cacheFetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  return await response.blob();
}

// TODO give make metadata a proper type
export async function googleFileUpdate(id: string, file: Blob, metadata: object) {
  const url = googleUrl(id, {
    uploadType: "multipart",
    fields: fileInfoKeys.join(","),
  });
  const body = new FormData();
  body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  body.append("file", file);
  const response = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body,
  });
  return response.json();
}

export async function googleFileCreate(file: Blob, metadata: object) {
  const url = googleUrl({
    uploadType: "multipart",
    fields: fileInfoKeys.join(","),
  });
  const body = new FormData();
  body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  body.append("file", file);
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body,
  });
  return response.json();
}

export async function googleFileGet(id: string): Promise<FileInfo> {
  const url = googleUrl(id, {
    fields: fileInfoKeys.join(","),
  });
  const response = await cacheFetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
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

export async function googleFilesGet(params: Record<string, string>, flush?: boolean) {
  const url = googleUrl(params);
  console.log('getHeaders()', getHeaders())
  const response = await cacheFetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
    },
    flush
  );
  return await response.json();
}

// TODO type for body?
export async function googleFilesCreate(params: Record<string, string>, body: object) {
  const url = googleUrl(params);
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return await response.json();
}

export async function folderExists(name: string) {
  console.log('folderExists')
  const result = await googleFilesGet({
    q: `trashed=false and name='${escapeQuery(name)}' and mimeType='application/vnd.google-apps.folder'`,
    pageSize: "1",
    fields: `files(${fileInfoKeys.join(",")})`,
  });
  // TODO handle 401
  //   {
  //     "error": {
  //         "code": 401,
  //         "message": "Request had invalid authentication credentials...
  //         "errors": [
  //             {
  //                 "message": "Invalid Credentials",
  //                 "domain": "global",
  //                 "reason": "authError",
  //                 "location": "Authorization",
  //                 "locationType": "header"
  //             }
  //         ],
  //         "status": "UNAUTHENTICATED"
  //     }
  // }
  console.log(result);
  return result.files[0];
}

export async function createFolder(name: string) {
  return await googleFilesCreate(
    {
      fields: fileInfoKeys.join(","),
    },
    {
      name,
      mimeType: "application/vnd.google-apps.folder",
    }
  );
}

export async function ensureFolder(name: string) {
  let folder = await folderExists(name);
  if (!folder) folder = await createFolder(name);
  return folder;
}

export async function listFiles() {
  const folder = await ensureFolder("gallery.challen.info");
  const result = await googleFilesGet(
    {
      q: `trashed=false and '${escapeQuery(folder.id)}' in parents`,
      pageSize: "12", // TODO set to something big?
      fields: `nextPageToken, files(${fileInfoKeys.join(",")})`,
    },
    true
  );
  return result.files;
}

export async function getFileBlob(id: string) {
  return await googleFileBlob(id);
}

export async function getFile(id: string) {
  return await googleFileGet(id);
}

export async function deleteFile(id: string) {
  await cacheFlush(); // TODO a bit of overkill to flush the entire cache
  return googleFileDelete(id);
}

export async function saveFile(id: string, name: string, file: Blob): Promise<{ id: string; name: string; modifiedTime: string }> {
  await cacheFlush(); // TODO a bit of overkill to flush the entire cache

  // TODO hard coded folder name?
  const folder = await ensureFolder("gallery.challen.info");
  if (id) {
    return await googleFileUpdate(id, file, {
      name,
      mimeType: "image/png", // TODO this could be automatic
      parents: [folder.id],
    });
  } else {
    return await googleFileCreate(file, {
      name,
      mimeType: "image/png", // TODO this could be automatic
      parents: [folder.id],
    });
  }
}
