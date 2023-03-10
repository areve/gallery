import { ref, type Ref } from "vue";
import { v4 as uuid } from "uuid";
import { usePersistentState } from "@/services/persistenceService";

declare let google: any;

const client_id = "750379347440-mp8am6q8hg41lvkn8pi4jku3eq7ts2lq.apps.googleusercontent.com";
const id_scope = "email profile openid";
//const all_scope = id_scope + " https://www.googleapis.com/auth/drive.file";
const all_scope = id_scope + " https://www.googleapis.com/auth/drive";

type AuthStateState = "in_progress" | "signed_in" | "signed_out";

export interface AuthState {
  idToken: string | null;
  accessToken: string | null;
  oauthState: string | null;
}

let isScriptAdded = false;
let isScriptLoaded = false;
export const authState = ref<AuthState>(defaultTokens());
usePersistentState("authState", authState);
loadFromHash();

function defaultTokens() {
  return <AuthState>{
    idToken: null,
    accessToken: null,
    oauthState: null,
  };
}

function getHashObject() {
  if (!/^#/.test(document.location.hash)) return {};
  const entries = new URLSearchParams(document.location.hash.substring(1));
  const result: { [value: string]: string } = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

function loadFromHash() {
  const hashObject = getHashObject();
  if (hashObject.state) {
    if (hashObject.state === authState.value.oauthState) {
      if (hashObject.access_token) authState.value.accessToken = hashObject.access_token;
      if (hashObject.id_token) authState.value.idToken = hashObject.id_token;
    }
    authState.value.oauthState = null;
    removeHashFromAddressBar();
  }
}

async function onScriptLoaded() {
  isScriptLoaded = true;
  await waitUntilLoaded();
  google.accounts.id.initialize({
    client_id,
    // ux_mode=redirect this worked, but it needs a server-side login_uri to receive the POST
    scope: all_scope,
    auto_select: true,
    callback: (response: any) => {
      authState.value.idToken = response.credential;
      const hint = parseJwt(response.credential).email;
      getToken("token", hint);
    },
  });

  if (getAuthState() == "signed_out") {
    google.accounts.id.prompt(); // it's nice sometimes but it can't do simultaneous "id_token token" login
  }
}

function waitUntilLoaded() {
  function test(resolve: (result: boolean) => void) {
    if (isScriptLoaded) resolve(true);
    else setTimeout(() => test(resolve));
  }
  return new Promise(test);
}

function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function removeHashFromAddressBar() {
  history.pushState("", document.title, window.location.pathname + window.location.search);
}

function addScript(script: string, onload: (event: Event) => any) {
  const tag = document.createElement("script");
  tag.setAttribute("src", script);
  tag.onload = (event: Event) => {
    return onload(event);
  };
  document.head.appendChild(tag);
}

function getToken(type: "token" | "id_token" | "id_token token", hint?: string) {
  authState.value.oauthState = uuid();
  let location =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?gsiwebsdk=3" +
    "&select_account=false" +
    `&state=${authState.value.oauthState}` +
    `&client_id=${encodeURIComponent(client_id)}` +
    `&redirect_uri=${encodeURIComponent(document.location.origin)}` +
    (hint ? `&login_hint=${encodeURIComponent(hint)}` : "") +
    `&response_type=${encodeURIComponent(type)}` +
    "&enable_serial_consent=true";

  if (type.split(" ").find((x) => x === "token")) {
    location += "&include_granted_scopes=true";
    location += `&scope=${encodeURIComponent(all_scope)}`;
  } else {
    location += `&scope=${encodeURIComponent(id_scope)}`;
  }

  if (type.split(" ").find((x) => x === "id_token")) {
    location += `&nonce=${uuid()}`;
  }

  document.location = location;
}

export function getAuthState(): AuthStateState {
  if (!!authState.value.accessToken !== !!authState.value.idToken) return "in_progress";
  if (!!authState.value.accessToken && !!authState.value.idToken) return "signed_in";
  return "signed_out";
}

// useGoogleAuth is only required for signOut, renderButton and showPrompt
export function useGoogleAuth() {
  if (isScriptAdded) return;
  isScriptAdded = true;
  addScript("https://accounts.google.com/gsi/client", () => onScriptLoaded());
}

// renderButton will create the google button, it's actually in iframe in the div, it's not nice to style
export async function renderButton(buttonWrapper: HTMLDivElement) {
  await waitUntilLoaded();
  google.accounts.id.renderButton(buttonWrapper, {
    theme: "filled_blue",
    shape: "pill",
    text: "signin",
    size: "medium",
  });
}

// showPrompt does not always trigger the prompt so needs a fallback. It's equivalent `getToken("id_token")`,
// I want `getToken("id_token token")` it can't do that in one load
export function showPrompt() {
  google.accounts.id.prompt();
}

export function signOut() {
  google.accounts.oauth2.revoke(authState.value.accessToken, (result: any) => {
    if (result.error) console.error(result);
    authState.value = defaultTokens();
  });
}

export function getAccessToken() {
  getToken("token");
}

export function getIdToken() {
  getToken("id_token");
}

export function signIn() {
  getBothTokens();
}

export function getBothTokens() {
  getToken("id_token token");
}
