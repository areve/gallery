<script setup lang="ts">
import { onMounted } from "vue";
import { decodeCredential, googleOneTap } from "vue3-google-login";
import EditorApp from "./components/EditorApp/EditorApp.vue";
import { loginState } from "./components/EditorApp/loginState";

// import { onMounted } from "vue";
// const gAuth = googleAuth.createGAuth({
//   clientId: "750379347440-mp8am6q8hg41lvkn8pi4jku3eq7ts2lq.apps.googleusercontent.com",
//   scope: "profile email",
//   prompt: "select_account",
//   ux_mode: "redirect",
//   redirect_uri: document.location.origin,
// });

// console.log(gAuth)

// onMounted(() => {
//   let checkGauthLoad = setTimeout(() => {
//     const isInit = !!gAuth.isInit;
//     const isAuthorized = !!gAuth.isAuthorized;
//     const profile = googleUserToProfile(gAuth?.GoogleAuth?.currentUser?.get());
//     console.log('profile', profile)
//     if (isInit) {
//     //  clearInterval(checkGauthLoad);
//     //   router.replace({ path: "/google-auth" });
//     }
//   }, 200);
// });

// function googleUserToProfile(googleUser: any) {
//   const profile = googleUser?.getBasicProfile();
//   console.log('get', profile)
//
//   return (
//     (profile && {
//       id: profile.getId(),
//       name: profile.getName(),
//       givenName: profile.getGivenName(),
//       familyName: profile.getFamilyName(),
//       imageUrl: profile.getImageUrl(),
//       email: profile.getEmail(),
//     }) ||
//     {}
//   );
// }
//     async signIn() {
//       const googleUser = await gAuth.signIn();
//       this.isAuthorized = gAuth.isAuthorized;
//       this.profile = this.googleUserToProfile(googleUser);
//     },
//     async signOut() {
//       await gAuth.signOut();
//       this.isAuthorized = gAuth.isAuthorized;
//       this.profile = {};
//     },
// const callback = (response: any) => {
//   // This callback will be triggered when the user selects or login to
//   // his Google account from the popup
//   const userData = decodeCredential(response.credential);

//   console.log("Handle the response", response, userData);
// };

const callback = (response: any) => {
  // This callback will be triggered automatically
  // if one single Google account is already logged in
  const userData = decodeCredential(response.credential) as any;
  console.log("Handle the response", response, userData);
  loginState.value = {
    name: userData.name,
    token: response.credential,
  };
};

// const idConfiguration = {
//   //login_uri: "http://localhost:3000/oauth",
//   ux_mode: "redirect",
// };
onMounted(() => {
  googleOneTap({ autoLogin: true })
    .then((response) => {
      // This promise is resolved when user selects an account from the the One Tap prompt
      const userData = decodeCredential(response.credential) as any;
      console.log("Handle the response", response, userData);
      loginState.value = {
        name: userData.name,
        token: response.credential,
      };
      console.log("loginState.value", loginState.value);
    })
    .catch((error) => {
      console.log("Handle the error", error);
    });
});
</script>

<template>
  <div class="app-wrapper">
    <EditorApp />
    <GoogleLogin :callback="callback" prompt auto-login />
  </div>
</template>

<style>
*[hidden] {
  display: none !important;
}

.app-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  touch-action: none;
}
</style>
