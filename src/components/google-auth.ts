import { ref, watchSyncEffect, type Ref } from "vue";
import { v4 as uuid } from "uuid";
import { usePersistentState } from "@/services/persistenceService";

declare let google: any;

const client_id = "750379347440-mp8am6q8hg41lvkn8pi4jku3eq7ts2lq.apps.googleusercontent.com";
const id_scope = "email profile openid";
const all_scope = id_scope + " https://www.googleapis.com/auth/drive.metadata.readonly";

export interface AuthState {
  idToken: string | null;
  accessToken: string | null;
  mode: "in_progress" | "signed_in" | "signed_out";
  state: string | null;
}

function defaultTokens() {
  return <AuthState>{
    idToken: null,
    accessToken: null,
    mode: "signed_out",
    state: null,
  };
}

export const authState = ref<AuthState>(defaultTokens());
usePersistentState("authState", authState);

function getAuthState() {
  if (!!authState.value.accessToken !== !!authState.value.idToken) return "in_progress";
  if (!!authState.value.accessToken && !!authState.value.idToken) return "signed_in";
  return "signed_out";
}
interface Options {
  buttonWrapper: Ref<HTMLDivElement>;
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
    // TODO I think I should really check state is the same here
    if (hashObject.access_token) authState.value.accessToken = hashObject.access_token;
    if (hashObject.id_token) authState.value.idToken = hashObject.id_token;
    authState.value.mode = getAuthState();
    removeHashFromAddressBar();
  }
}
loadFromHash();

async function initialize(options: Options) {
  await waitUntilLoaded();
  const opts = {
    client_id,
    // ux_mode: "redirect", // this worked, but needs my redirect page to receive the POST
    // login_uri: "http://localhost:8080/login", // this worked, but needs my redirect page to receive the POST
    response_type: "token id_token",
    scope: all_scope,
    auto_select: true,
    callback: (response: any) => {
      authState.value.idToken = response.credential;
      const hint = parseJwt(response.credential).email;
      getToken("token", hint);
    },
  };
  google.accounts.id.initialize(opts);

  google.accounts.id.renderButton(options.buttonWrapper.value, {
    theme: "filled_blue",
    shape: "pill",
    text: "signin",
    size: "medium",
  });

  if (!authState.value.accessToken && !authState.value.idToken) {
    //google.accounts.id.prompt(); // TODO it's kind of nice sometimes
  }

  function waitUntilLoaded() {
    function test(resolve: (result: boolean) => void) {
      if (options.buttonWrapper.value) {
        resolve(true);
      } else {
        setTimeout(() => test(resolve));
      }
    }
    return new Promise(test);
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

export function use(options: Options) {
  addScript("https://accounts.google.com/gsi/client", () => initialize(options));
}

export function signOut() {
  google.accounts.oauth2.revoke(authState.value.accessToken, (result: any) => {
    if (result.error) console.error(result);
    authState.value = defaultTokens();
  });
}

function getToken(type: "token" | "id_token" | "id_token token", hint?: string) {
  const state = uuid();
  let uri =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?gsiwebsdk=3" +
    "&select_account=false" +
    `&state=${state}` +
    `&client_id=${encodeURIComponent(client_id)}` +
    `&redirect_uri=${encodeURIComponent(document.location.origin)}` +
    (hint ? `&login_hint=${encodeURIComponent(hint)}` : "") +
    `&response_type=${encodeURIComponent(type)}` +
    "&enable_serial_consent=true";

  if (type.split(" ").find((x) => x === "token")) {
    uri += "&include_granted_scopes=true";
    uri += `&scope=${encodeURIComponent(all_scope)}`;
  } else {
    uri += `&scope=${encodeURIComponent(id_scope)}`;
  }

  if (type.split(" ").find((x) => x === "id_token")) {
    uri += `&nonce=${uuid()}`;
  }

  document.location = uri;

  authState.value.mode = getAuthState();
}

export function signIn() {
  // TODO this does not always trigger the prompt, so needs to fallback to it's equivalent `getToken("id_token")`
  google.accounts.id.prompt();
}

export function getAccessToken() {
  getToken("token");
}

export function getIdToken() {
  getToken("id_token");
}

export function getBothTokens() {
  getToken("id_token token");
}
