<script setup lang="ts">
import EditorApp from "./components/EditorApp/EditorApp.vue";

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
const callback = (response: any) => {
  // This callback will be triggered when the user selects or login to
  // his Google account from the popup
  console.log("Handle the response", response);
};
</script>

<template>
  <div class="app-wrapper">
    <EditorApp />
    <GoogleLogin :callback="callback" />
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
