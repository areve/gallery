import { ref } from "vue";

interface LoginState {
  name: string;
  token: string | null;
}
export const loginState = ref<LoginState>({
  name: "anon",
  token: null,
});
