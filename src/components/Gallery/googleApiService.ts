import axios from "axios";
import { loadImage } from "@/lib/utils";
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
  await waitUntilLoaded();
  const folder = await ensureFolder("gallery.challen.info");
  try {
    const response = await gapi.client.drive.files.list({
      q: ` trashed=false and '${escapeQuery(folder.id)}' in parents`,
      pageSize: 10,
      // TODO thumbnailLink is an option but to use it I need a proxy because of CORS
      fields: "nextPageToken, files(id, name, parents, mimeType, modifiedTime)",
    });
    return response.result.files;
  } catch (err: any) {
    console.error(err.message);
    return;
  }
}

export async function getFileAsDataUrl(id: string) {
  await waitUntilLoaded();
  const response = await gapi.client.drive.files.get({
    fileId: id,
    alt: "media",
  });
  // may be able to use URL.createObjectURL
  return "data:image/png;base64," + btoa(response.body);
}

export async function getFile(id: string) {
  await waitUntilLoaded();
  try {
    return await gapi.client.drive.files.get({
      fileId: id,
      fields: "id, name, parents, mimeType, modifiedTime",
    });
  } catch (err: any) {
    console.error(err.message);
    return;
  }
}

export async function saveFile(name: string, file: Blob): Promise<{ id: string; modifiedTime: string }> {
  await waitUntilLoaded();

  const folder = await ensureFolder("gallery.challen.info");

  //const fileContent = "sample text"; // As a sample, upload a text file.
  //const file = new Blob([atob(dataUrl.replace("data:image/png;base64,", ""))], { type: "image/png" });
  //  const file = new Blob([atob(dataUrl.replace("data:image/png;base64,", ""))], { type: "image/png" });
  const metadata = {
    name: "foobar.png",
    mimeType: "image/png",
    parents: [folder.id]
  };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);
  const accessToken = gapi.auth.getToken().access_token;

  //try {
  return new Promise((resolve, reject) => {
    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body: form,
      // method: "POST",
      // headers: new Headers({ Authorization: "Bearer " + accessToken }),
      // body: form,
      // const blah = {
      //   resource: ,
      //   // media: {
      //   //   dataUrl: atob(dataUrl.replace("data:image/png;base64,", "")),
      //   // },
      //   fields: "id, name, parents, mimeType, modifiedTime",
      // };
    })
      .then(async (res) => {
        console.log(res);
        console.log(res.body);
        console.log(await res.json());
      })
      .then(function (val) {
        console.log(val);
      });
  });

  //   console.log(blah);
  //   const response = await gapi.client.drive.files.create(blah);
  //   return response.result;
  // } catch (err: any) {
  //   console.error(err.message);
  //   return;
  // }
}
