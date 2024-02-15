import { ref, watchPostEffect } from "vue";
import { v4 as uuid } from "uuid";
import { usePersistentState } from "../PersistentState";

declare let google: any;
declare let gapi: any;

const client_id = "750379347440-mp8am6q8hg41lvkn8pi4jku3eq7ts2lq.apps.googleusercontent.com";
const id_scope = "email profile openid";
// //const all_scope = id_scope + " https://www.googleapis.com/auth/drive.file";
const all_scope = id_scope + " https://www.googleapis.com/auth/drive";

type AuthStateState = "inProgress" | "signedIn" | "signedOut";

export interface AuthState {
  idToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  oauthState: string | null;
  state: AuthStateState;
}

// watchPostEffect(() => {
//   authState.value.state = getAuthState();
// });
// let isScriptAdded = false;
// let isScriptLoaded = false;
export const authState = ref<AuthState>(defaultTokens());

usePersistentState("googleAuthState", authState);
loadTokensFromUrlHashIfPresent();

function defaultTokens() {
  return <AuthState>{
    idToken: null,
    accessToken: null,
    refreshToken: null,
    oauthState: null,
    state: "signedOut",
  };
}

// Docs were here https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
function getToken(type: "id_token token", hint?: string) {
  document.location = getAuth2Url(type, hint);
}

function getAuth2Url(type: "id_token token", hint?: string) {
  // "token" | "id_token" | "id_token token code"
  authState.value.oauthState = uuid();
  let url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?gsiwebsdk=3" +
    "&select_account=true" +
    "&access_type=online" +
    `&response_type=${encodeURIComponent(type)}` +
    `&state=${authState.value.oauthState}` +
    `&client_id=${encodeURIComponent(client_id)}` +
    `&redirect_uri=${encodeURIComponent(document.location.origin)}` +
    (hint ? `&login_hint=${encodeURIComponent(hint)}` : "") +
    "&enable_serial_consent=true";
  //
  if (type.split(" ").find((x) => x === "token")) {
    url += "&include_granted_scopes=true";
    url += `&scope=${encodeURIComponent(all_scope)}`;
  } else {
    url += `&scope=${encodeURIComponent(id_scope)}`;
  }

  if (type.split(" ").find((x) => x === "id_token")) {
    url += `&nonce=${uuid()}`;
  }

  return url;
}

// TODO a good name, but I can make a better
// TODO handle an error response https://oauth2.example.com/callback#error=access_denied
function loadTokensFromUrlHashIfPresent() {
  const hashObject = getHashObject();

  if (window.parent !== window) {
    // TODO tell the parent window?
    (window.parent as any).completeSilentRefresh(hashObject);
    document.location = "about:blank";
    return;
  }

  loadTokensFromHashObject(hashObject);
  removeHashFromAddressBar();

  function getHashObject() {
    if (!/^#/.test(document.location.hash)) return {};
    const entries = new URLSearchParams(document.location.hash.substring(1));
    const result: { [value: string]: string } = {};
    for (const [key, value] of entries) {
      result[key] = value;
    }
    return result;
  }

  function removeHashFromAddressBar() {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }
}

function loadTokensFromHashObject(hashObject: { [value: string]: string }) {
  if (hashObject.state) {
    if (hashObject.state === authState.value.oauthState) {
      if (hashObject.access_token) authState.value.accessToken = hashObject.access_token;
      if (hashObject.id_token) authState.value.idToken = hashObject.id_token;
      if (hashObject.code) authState.value.refreshToken = hashObject.code;
    }
    authState.value.oauthState = null;
    authState.value.state = "signedIn";
  }
}

// TODO read revoking a token https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#tokenrevoke

// async function onScriptLoaded() {
// console.log("onScriptLoaded");
// isScriptLoaded = true;
// await waitUntilLoaded();
// console.log(gapi);

// gapi.load('client:auth2', initClient);
//   google.accounts.id.initialize({
//     client_id,
//     // ux_mode=redirect this worked, but it needs a server-side login_uri to receive the POST
//     scope: all_scope,
//     // TODO make auto_select an option passed in to useGoogleAuth
//     // TODO auto sign in again if we get 401 from googleApi and silent refresh!?
//     auto_select: false,
//     callback: (response: any) => {
//       authState.value.idToken = response.credential;
//       console.log(parseJwt(response.credential))
//       const hint = parseJwt(response.credential).email;
//       getToken("token", hint);
//     },
//   });
//   if (getAuthState() == "signedOut") {
//     google.accounts.id.prompt(); // it's nice sometimes but it can't do simultaneous "id_token token" login
//   }
// }

// function waitUntilLoaded() {
//   function test(resolve: (result: boolean) => void) {
//     if (isScriptLoaded) resolve(true);
//     else setTimeout(() => test(resolve));
//   }
//   return new Promise(test);
// }

// export function parseJwt(token: string) {
//   const base64Url = token.split(".")[1];
//   const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//   const jsonPayload = decodeURIComponent(
//     atob(base64)
//       .split("")
//       .map(function (c) {
//         return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//       })
//       .join("")
//   );

//   return JSON.parse(jsonPayload);
// }

// function addScript(script: string, onload: (event: Event) => any) {
//   const tag = document.createElement("script");
//   tag.setAttribute("src", script);
//   tag.onload = (event: Event) => {
//     return onload(event);
//   };
//   document.head.appendChild(tag);
// }

// function getAuthState(): AuthStateState {
//   if (!!authState.value.accessToken !== !!authState.value.idToken) return "inProgress";
//   if (!!authState.value.accessToken && !!authState.value.idToken) return "signedIn";
//   return "signedOut";
// }

// // renderButton will create the google button, it's actually in iframe in the div, it's not nice to style
// export async function renderButton(buttonWrapper: HTMLDivElement) {
//   await waitUntilLoaded();
//   google.accounts.id.renderButton(buttonWrapper, {
//     theme: "filled_blue",
//     shape: "pill",
//     text: "signin",
//     size: "medium",
//   });
// }

// // showPrompt does not always trigger the prompt so needs a fallback. It's equivalent `getToken("id_token")`,
// // I want `getToken("id_token token")` it can't do that in one load
// export function showPrompt() {
//   google.accounts.id.prompt();
// }

// export function getAccessToken() {
//   getToken("token");
// }

// export function getIdToken() {
//   getToken("id_token");
// }

// export function getBothTokens() {

// }

// // useGoogleAuth is only required for signOut, renderButton and showPrompt
export function useGoogleAuth() {
  // TODO this method will be removed, I think
  //   if (isScriptAdded) return;
  //   isScriptAdded = true;
  //
  // addScript("https://apis.google.com/js/api.js", () => onScriptLoaded());
  //   addScript("https://accounts.google.com/gsi/client", () => onScriptLoaded());
}

export function signIn() {
  getToken("id_token token");
}

export function signOut() {
  //   google.accounts.oauth2.revoke(authState.value.accessToken, (result: any) => {
  //     if (result.error) console.error(result);
  authState.value = defaultTokens();
  //   });
}

export async function refreshToken() {
  console.log("authState.value", authState.value);

  const type = "id_token token";
  const hint = undefined;

  const iframe = createHiddenIframe();
  document.body.appendChild(iframe);

  // TODO if the process takes more than a second then assume it's gone wrong
  // TODO if I'm going to persue this auth method then, this should be called often, and before expires_in
  // TODO it'd be nice if we didn't have to load the whole app in the hidden iframe, but that would require a new login redirect url, or some messing in main.ts
  (window as any).completeSilentRefresh = function (hashObject: { [value: string]: string }) {
    loadTokensFromHashObject(hashObject);
    iframe.parentElement?.removeChild(iframe);
  };

  iframe.src = getAuth2Url(type, hint);

  function createHiddenIframe() {
    const iframe = document.createElement("iframe");
    iframe.width = "0";
    iframe.height = "0";
    iframe.style.position = "absolute";
    iframe.style.left = "-10000px";
    iframe.style.top = "-10000px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.opacity = "0";
    return iframe;
  }
}
