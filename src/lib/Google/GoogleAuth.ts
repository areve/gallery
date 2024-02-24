import { v4 as uuid } from "uuid";
import { googleAuthConfig } from "./googleAuthConfig";
import { defaultAuthState, googleAuthState } from "./googleAuthState";
import { progressError } from "@/components/Notify/notifyState";

type AuthStateState = "inProgress" | "signedIn" | "signedOut";

export interface AuthState {
  idToken: string | null;
  accessToken: string | null;
  oauthState: string | null;
  expiresAt: Date | null;
  state: AuthStateState;
}

handleTokensInUrlHash();

const intervalHandle = setInterval(checkTokenExpiry, 1000);
if (import.meta.hot) {
  import.meta.hot.accept(() => clearInterval(intervalHandle));
}

function handleTokensInUrlHash() {
  const hashObject = getHashObject();

  const isLoadedInIframe = window.parent !== window;
  const windowParentAny = window.parent as any;
  if (isLoadedInIframe && windowParentAny.completeSilentRefresh) {
    windowParentAny.completeSilentRefresh(hashObject);
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
  googleAuthState.value.oauthState = uuid();
  let url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?gsiwebsdk=3" +
    "&select_account=true" +
    "&access_type=online" +
    `&response_type=${encodeURIComponent(type)}` +
    `&state=${googleAuthState.value.oauthState}` +
    `&client_id=${encodeURIComponent(googleAuthConfig.clientId)}` +
    `&redirect_uri=${encodeURIComponent(document.location.origin)}` +
    (hint ? `&login_hint=${encodeURIComponent(hint)}` : "") +
    "&enable_serial_consent=true" +
    `&scope=${encodeURIComponent(`${googleAuthConfig.idScope} ${googleAuthConfig.accessScope}`.trim())}`;
  if (type.split(" ").find((x) => x === "token")) url += "&include_granted_scopes=true";
  if (type.split(" ").find((x) => x === "id_token")) url += `&nonce=${uuid()}`;
  return url;
}

function loadTokensFromHashObject(hash: { [value: string]: string }) {
  if (hash.state) {
    if (hash.error) {
      console.error("error:", hash.error);
      googleAuthState.value = defaultAuthState();
    } else {
      if (hash.state === googleAuthState.value.oauthState) {
        if (hash.access_token) googleAuthState.value.accessToken = hash.access_token;
        if (hash.id_token) googleAuthState.value.idToken = hash.id_token;
      }
      googleAuthState.value.oauthState = null;
      googleAuthState.value.state = "signedIn";
      googleAuthState.value.expiresAt = new Date(new Date().getTime() + parseInt(hash.expires_in) * 1000);
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

async function checkTokenExpiry() {
  const expiresInLessThanTenMinutes = googleAuthState.value.expiresAt && new Date().getTime() + 600000 > googleAuthState.value.expiresAt.getTime();
  if (expiresInLessThanTenMinutes) await refreshTokens();
}

export async function refreshTokens() {
  const type = "id_token token";
  const hint = googleAuthState.value.idToken ? parseJwt(googleAuthState.value.idToken).email : undefined;

  const iframe = createHiddenIframe();
  document.body.appendChild(iframe);
  progressError(undefined);

  let silentRefreshCompleted = false;
  const silentRefreshTimeout = setTimeout(() => {
    if (!silentRefreshCompleted) {
      // TODO this fired after I opened my laptop... perhaps it would, but I feel value.expiresAt was updated!?
      console.error("completeSilentRefresh did not return within 5 seconds");
      progressError("refreshing tokens failed");
    }
  }, 5000);

  const windowAny = window as any;
  windowAny.completeSilentRefresh = (hashObject: { [value: string]: string }) => {
    silentRefreshCompleted = !!hashObject.access_token;
    loadTokensFromHashObject(hashObject);
    clearTimeout(silentRefreshTimeout);
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
  if (googleAuthState.value.accessToken) await revokeAccess(googleAuthState.value.accessToken);
  googleAuthState.value = defaultAuthState();
}
