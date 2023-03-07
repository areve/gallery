import { watchPostEffect } from "vue";
import { authState } from "@/services/googleAuthService";

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
function waitUntilLoaded() {
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
  let response;
  try {
    response = await gapi.client.drive.files.list({
      q: `trashed=false and name='${escapeQuery(name)}' and mimeType='application/vnd.google-apps.folder'`,
      pageSize: 1,
      fields: "files(id, name, parents, mimeType, modifiedTime)",
    });
  } catch (err: any) {
    console.error(err.message);
    return null;
  }
  return response.result.files[0];
}

export async function createFolder(name: string) {
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
  const folder = await ensureFolder("gallery.challen.info");
  try {
    const response = await gapi.client.drive.files.list({
      q: ` trashed=false and '${escapeQuery(folder.id)}' in parents`,
      pageSize: 10,
      fields: "nextPageToken, files(id, name, parents, mimeType, modifiedTime)",
    });
    return response.result;
  } catch (err: any) {
    console.error(err.message);
    return;
  }
}
