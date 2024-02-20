import { ref } from "vue";
import { usePersistentState } from "../PersistentState";
import type { AuthState } from "./GoogleAuth";

export const googleAuthState = ref<AuthState>(defaultAuthState());
usePersistentState("googleAuthState", googleAuthState);

export function defaultAuthState() {
  return <AuthState>{
    idToken: null,
    accessToken: null,
    oauthState: null,
    expiresAt: null,
    state: "signedOut",
  };
}
