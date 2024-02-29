export function escapeQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export const fileInfoKeys = ["id", "name", "modifiedTime"];
export const fileInfoKeysWithThumbnail = [...fileInfoKeys, "thumbnailLink"];
export interface FileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  thumbnailLink?: string;
}

function googleDriveFilesUrl(id: string): string;
function googleDriveFilesUrl(params: Record<string, string>): string;
function googleDriveFilesUrl(id: string, params: Record<string, string>): string;
function googleDriveFilesUrl(idOrParams: string | Record<string, string>, params?: Record<string, string>) {
  if (typeof idOrParams === "object") {
    const params = idOrParams;
    return `https://www.googleapis.com/drive/v3/files?${new URLSearchParams(params)}`;
  }
  const id = idOrParams;
  if (params) return `https://www.googleapis.com/drive/v3/files/${id}?${new URLSearchParams(params)}`;
  return `https://www.googleapis.com/drive/v3/files/${id}`;
}

function googleDriveFilesUploadUrl(id: string): string;
function googleDriveFilesUploadUrl(params: Record<string, string>): string;
function googleDriveFilesUploadUrl(id: string, params: Record<string, string>): string;
function googleDriveFilesUploadUrl(idOrParams: string | Record<string, string>, params?: Record<string, string>) {
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

export async function googleFileGet(name: string, folderId: string, accessToken: string): Promise<FileInfo | undefined> {
  // TODO pages and nextPageToken are not supported anywhere in this file
  return (
    await googleFilesGetInternal(
      {
        q: `trashed=false and '${escapeQuery(folderId)}' in parents and name='${escapeQuery(name)}'`,
        fields: `nextPageToken, files(${fileInfoKeysWithThumbnail.join(",")})`,
      },
      accessToken,
    )
  )[0];
}

export async function googleFilesGet(folderId: string, accessToken: string) {
  // TODO pages and nextPageToken are not supported anywhere in this file
  return await googleFilesGetInternal(
    {
      q: `trashed=false and '${escapeQuery(folderId)}' in parents`,
      fields: `nextPageToken, files(${fileInfoKeysWithThumbnail.join(",")})`,
    },
    accessToken,
  );
}

export async function googleFileBlob(id: string, accessToken: string) {
  const url = googleDriveFilesUrl(id, {
    alt: "media",
  });
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(accessToken),
  });
  if (response.status !== 200) throw `googleFileBlob unexpected status: ${response.status}`;
  return await response.blob();
}

export async function googleFileUpdate(id: string, name: string, file: Blob, accessToken: string) {
  const url = googleDriveFilesUploadUrl(id, {
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
  if (response.status !== 200) throw `googleFileUpdate unexpected status: ${response.status}`;
  return (await response.json()) as FileInfo;
}

export async function googleFileCreate(folderId: string, name: string, file: Blob, accessToken: string) {
  const url = googleDriveFilesUploadUrl({
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
  if (response.status !== 200) throw `googleFileCreate unexpected status: ${response.status}`;
  return (await response.json()) as FileInfo;
}

async function googleFilesGetInternal(params: Record<string, string>, accessToken: string) {
  const url = googleDriveFilesUrl(params);
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(accessToken),
  });
  if (response.status !== 200) throw `googleFilesGetInternal unexpected status: ${response.status}`;
  const result = await response.json();
  return result.files as FileInfo[];
}

export async function googleFolderCreate(name: string, folderId: string | undefined, accessToken: string) {
  const url = googleDriveFilesUrl({
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
  if (response.status !== 200) throw `googleFolderCreate unexpected status: ${response.status}`;
  return (await response.json()) as FileInfo;
}

export async function googleFolderGet(name: string, folderId: string | undefined, accessToken: string): Promise<FileInfo | undefined> {
  const parentsClause = folderId ? ` and '${escapeQuery(folderId)}' in parents ` : "";
  const result = await googleFilesGetInternal(
    {
      q: `trashed=false and name='${escapeQuery(name)}' and mimeType='application/vnd.google-apps.folder' ${parentsClause}`,
      pageSize: "1",
      fields: `files(${fileInfoKeys.join(",")})`,
    },
    accessToken,
  );
  return result[0];
}

async function googleMakePath(path: string, readonly: boolean, accessToken: string) {
  const splitPath = path.split("/").filter((p) => p !== "");

  const foldersInPath = [];
  let folderId: string | undefined;
  for (let i = 0; i < splitPath.length; i++) {
    let folder = await googleFolderGet(splitPath[i], folderId, accessToken);
    if (!folder && !readonly) folder = await googleFolderGetOrCreate(splitPath[i], folderId, accessToken);
    folderId = folder?.id;
    foldersInPath.push(folder);
    if (!folder) return foldersInPath;
  }

  return foldersInPath;
}

export async function googlePathGetOrCreate(path: string, accessToken: string) {
  return googleMakePath(path, false, accessToken);
}

export async function googlePathGet(path: string, accessToken: string) {
  return googleMakePath(path, true, accessToken);
}

export async function googleFolderGetOrCreate(name: string, folderId: string | undefined, accessToken: string): Promise<FileInfo> {
  let folder = await googleFolderGet(name, folderId, accessToken);
  if (!folder) folder = await googleFolderCreate(name, folderId, accessToken);
  return folder;
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
// if (response.status !== 200) throw `googleFileGet unexpected status: ${response.status}`;
//   return (await response.json()) as FileInfo;
// }

// export async function googleFileDelete(id: string) {
//   const url = googleUrl(id);
//   const response = await fetch(url, {
//     method: "DELETE",
//     headers: getHeaders(),
//   });
// if (response.status !== 200) throw `googleFileDelete unexpected status: ${response.status}`;
//   return response.status === 204;
// }
