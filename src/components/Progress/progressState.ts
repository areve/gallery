import { ref } from "vue";

export interface ProgressState {
  message?: string;
  max: number;
  value: number;
  error?: string;
}

export const progressState = ref<ProgressState>({
  max: 0,
  value: 0,
  message: "",
  error: undefined,
});
