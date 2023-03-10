import { watchPostEffect } from "vue";
import { authState } from "@/services/googleAuthService";
import { cacheFetch, cacheFlush } from "@/services/cacheService";

declare let gapi: any;

const discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

let isScriptAdded = false;
let isScriptLoaded = false;

async function onScriptLoaded() {
  gapi.load("client", async function () {
    await gapi.client.init({
      discoveryDocs,
    });
    isScriptLoaded = true;
  });
}

async function waitUntilLoaded() {
  function test(resolve: (result: boolean) => void) {
    if (isScriptLoaded) resolve(true);
    else setTimeout(() => test(resolve));
  }
  return new Promise(test);
}

watchPostEffect(async () => {
  await waitUntilLoaded();
  if (authState.value.accessToken) {
    gapi.client.setToken({
      access_token: authState.value.accessToken,
    });
  } else {
    gapi.client.setToken("");
  }
});

function addScript(script: string, onload: (event: Event) => any) {
  const tag = document.createElement("script");
  tag.setAttribute("src", script);
  tag.onload = (event: Event) => {
    return onload(event);
  };
  document.head.appendChild(tag);
}

export function useGoogleApi() {
  if (isScriptAdded) return;
  isScriptAdded = true;
  addScript("https://apis.google.com/js/api.js", () => onScriptLoaded());
}

export function escapeQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function folderExists(name: string) {
  await waitUntilLoaded();
  try {
    const params: Record<string, string> = {
      q: `trashed=false and name='${escapeQuery(name)}' and mimeType='application/vnd.google-apps.folder'`,
      pageSize: "1",
      fields: "files(id,name,parents,mimeType,modifiedTime)",
    };
    const url = "https://www.googleapis.com/drive/v3/files?" + new URLSearchParams(params).toString();
    const response = await cacheFetch(url, {
      method: "GET",
      headers: new Headers({ Authorization: `Bearer ${gapi.auth.getToken().access_token}` }),
    });
    const result = await response.json();
    return result.files[0];
  } catch (err: any) {
    console.error(err.message);
    return null;
  }
}

export async function createFolder(name: string) {
  await waitUntilLoaded();
  try {
    const response = await gapi.client.drive.files.create({
      resource: {
        name,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id, name, parents, mimeType, modifiedTime",
    });
    return response.result;
  } catch (err: any) {
    console.error(err.message);
    return null;
  }
}

export async function ensureFolder(name: string) {
  let folder = await folderExists(name);
  if (!folder) folder = await createFolder(name);
  return folder;
}

export async function listFiles() {
  await waitUntilLoaded();
  const folder = await ensureFolder("gallery.challen.info");
  try {
    const params: Record<string, string> = {
      q: `trashed=false and '${escapeQuery(folder.id)}' in parents`,
      pageSize: "12", // TODO set to something big?
      fields: "nextPageToken, files(id, name, parents, mimeType, modifiedTime)",
    };
    const url = "https://www.googleapis.com/drive/v3/files?" + new URLSearchParams(params).toString();
    const response = await cacheFetch(url, {
      method: "GET",
      headers: new Headers({ Authorization: `Bearer ${gapi.auth.getToken().access_token}` }),
    });
    const result = await response.json();
    return result.files;
  } catch (err: any) {
    console.error(err.message);
    return null;
  }
}

export async function getBytes(id: string) {
  await waitUntilLoaded();
  // https://content.googleapis.com/drive/v3/files/12XG2BWDp4EGheg-VNPtUDSS8tNuViH57?alt=media

  // TODO try without all these .toString()'s
  const params: Record<string, string> = {
    alt: "media",
  };
  const url = `https://www.googleapis.com/drive/v3/files/${id}?${new URLSearchParams(params).toString()}`;
  const response = await cacheFetch(url, {
    method: "GET",
    headers: new Headers({ Authorization: `Bearer ${gapi.auth.getToken().access_token}` }),
  });
  const bytes = await response.blob();
  return bytes;
}

export async function getFile(id: string) {
  await waitUntilLoaded();
  try {
    return getBytes(id);
  } catch (err: any) {
    console.error(err.message);
    return;
  }
}

export async function deleteFile(id: string) {
  await waitUntilLoaded();
  await cacheFlush() // TODO a bit of overkill to flush the entire cache
  try {
    const response = await gapi.client.drive.files.delete({
      fileId: id,
      fields: "id, name, parents, mimeType, modifiedTime",
    });

    return response.result;
  } catch (err: any) {
    console.error(err.message);
    return;
  }
}

export async function saveFile(id: string, name: string, file: Blob): Promise<{ id: string; name: string; modifiedTime: string }> {
  await waitUntilLoaded();
  const folder = await ensureFolder("gallery.challen.info");
  if (id) {
    const metadata = {
      name,
      mimeType: "image/png",
    };

    const body = new FormData();
    body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    body.append("file", file);
    const accessToken = gapi.auth.getToken().access_token;

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files/" + id + "?uploadType=multipart&fields=id,name,modifiedTime", {
      method: "PATCH",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body,
    });

    return response.json();
  } else {
    const metadata = {
      name,
      mimeType: "image/png",
      parents: [folder.id],
    };

    const body = new FormData();
    body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    body.append("file", file);
    const accessToken = gapi.auth.getToken().access_token;

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body,
    });

    return response.json();
  }
}
