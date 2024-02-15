import { ref } from "vue";
import { v4 as uuid } from "uuid";
import { usePersistentState } from "../PersistentState";
import { googleAuthConfig } from "./googleAuthConfig";

let refreshInterval: NodeJS.Timeout | undefined;
type AuthStateState = "inProgress" | "signedIn" | "signedOut";

export interface AuthState {
  idToken: string | null;
  accessToken: string | null;
  oauthState: string | null;
  state: AuthStateState;
}

export const authState = ref<AuthState>(defaultAuthState());
usePersistentState("googleAuthState", authState);

handleTokensInUrlHash();

function defaultAuthState() {
  return <AuthState>{
    idToken: null,
    accessToken: null,
    oauthState: null,
    state: "signedOut",
  };
}

function handleTokensInUrlHash() {
  const hashObject = getHashObject();

  const isLoadedInIframe = window.parent !== window;
  if (isLoadedInIframe) {
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

function getAuth2Url(type: "id_token token" | "id_token" | "token", hint?: string) {
  authState.value.oauthState = uuid();
  let url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?gsiwebsdk=3" +
    "&select_account=true" +
    "&access_type=online" +
    `&response_type=${encodeURIComponent(type)}` +
    `&state=${authState.value.oauthState}` +
    `&client_id=${encodeURIComponent(googleAuthConfig.clientId)}` +
    `&redirect_uri=${encodeURIComponent(document.location.origin)}` +
    (hint ? `&login_hint=${encodeURIComponent(hint)}` : "") +
    "&enable_serial_consent=true";
  if (type.split(" ").find((x) => x === "token")) {
    url += "&include_granted_scopes=true";
    url += `&scope=${encodeURIComponent(googleAuthConfig.clientId + " " + googleAuthConfig.accessScope)}`;
  } else {
    url += `&scope=${encodeURIComponent(googleAuthConfig.clientId)}`;
  }
  if (type.split(" ").find((x) => x === "id_token")) url += `&nonce=${uuid()}`;
  return url;
}

function loadTokensFromHashObject(hash: { [value: string]: string }) {
  clearInterval(refreshInterval);
  if (hash.state) {
    if (hash.error) {
      console.error("error:", hash.error);
      authState.value = defaultAuthState();
      refreshInterval = undefined;
    } else {
      if (hash.state === authState.value.oauthState) {
        if (hash.access_token) authState.value.accessToken = hash.access_token;
        if (hash.id_token) authState.value.idToken = hash.id_token;
      }
      authState.value.oauthState = null;
      authState.value.state = "signedIn";
      refreshInterval = setInterval(refreshTokens, (parseInt(hash.expires_in) * 1000) / 5);
    }
  }
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
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

async function revokeAccess(token: string) {
  const revokeTokenEndpoint = "https://oauth2.googleapis.com/revoke";
  const repsonse = await fetch(revokeTokenEndpoint, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  console.assert(repsonse.status === 200, `revoke failed with status: ${repsonse.status}`);
}

async function refreshTokens() {
  console.log("refreshing token");
  const type = "id_token token";
  const hint = authState.value.idToken ? parseJwt(authState.value.idToken).email : undefined;

  const iframe = createHiddenIframe();
  document.body.appendChild(iframe);

  (window as any).completeSilentRefresh = function (hashObject: { [value: string]: string }) {
    loadTokensFromHashObject(hashObject);
    console.log("refreshing token complete", hashObject);
    iframe.parentElement?.removeChild(iframe);
  };

  iframe.src = getAuth2Url(type, hint);

  function createHiddenIframe() {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    return iframe;
  }
}

export function signIn() {
  document.location = getAuth2Url("id_token token");
}

export async function signOut() {
  if (authState.value.accessToken) await revokeAccess(authState.value.accessToken);
  authState.value = defaultAuthState();
  clearInterval(refreshInterval);
  refreshInterval = undefined;
}
