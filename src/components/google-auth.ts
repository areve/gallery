import { ref, type Ref } from "vue";

declare let google: any;

const client_id = "750379347440-mp8am6q8hg41lvkn8pi4jku3eq7ts2lq.apps.googleusercontent.com";
const scope = "email profile openid https://www.googleapis.com/auth/drive.metadata.readonly";

export interface AuthState {
  idToken: string | null;
  accessToken: string | null;
  state: "in_progress" | "signed_in" | "signed_out";
}

function defaultTokens() {
  return <AuthState>{
    idToken: null,
    accessToken: null,
    state: "signed_out",
  };
}
export const authState = ref<AuthState>(defaultTokens());

if (sessionStorage.getItem("tokens")) {
  authState.value = JSON.parse(sessionStorage.getItem("tokens")!);
}

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
async function initialize(options: Options) {
  const hashObject = getHashObject();
  if (hashObject.access_token) {
    authState.value.accessToken = hashObject.access_token;
    authState.value.state = getAuthState();
    sessionStorage.setItem("tokens", JSON.stringify(authState.value));
    removeHash();
  }
  await waitUntilLoaded();
  google.accounts.id.initialize({
    client_id,
    // ux_mode: "redirect", // this worked, but needs my redirect page to receive the POST
    // login_uri: "http://localhost:8080/login", // this worked, but needs my redirect page to receive the POST
    scope: scope,
    auto_select: true,
    callback: function (response: any) {
      const hint = parseJwt(response.credential).email;
      document.location =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        "?gsiwebsdk=3" +
        "&client_id=" +
        encodeURIComponent(client_id) +
        "&scope=" +
        encodeURIComponent(scope) +
        "&redirect_uri=" +
        encodeURIComponent(document.location.origin) +
        "&login_hint=" +
        encodeURIComponent(hint) +
        "&response_type=token" +
        "&include_granted_scopes=true" +
        "&enable_serial_consent=true";
      authState.value.idToken = response.credential;
      authState.value.state = getAuthState();
      sessionStorage.setItem("tokens", JSON.stringify(authState.value));
    },
  });

  google.accounts.id.renderButton(options.buttonWrapper.value, {
    theme: "filled_blue",
    shape: "pill",
    text: "signin",
    size: "medium",
  });

  if (!authState.value.accessToken && !authState.value.idToken) {
    google.accounts.id.prompt();
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

function removeHash() {
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

export function signout() {
  google.accounts.oauth2.revoke(authState.value.accessToken, (result: any) => {
    if (result.error) console.error(result);
    authState.value = defaultTokens();
    sessionStorage.setItem("tokens", JSON.stringify(authState.value));
  });
}
