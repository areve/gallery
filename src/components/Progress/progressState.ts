import { ref } from "vue";

export interface ProgressState {
  message?: string;
  error?: string;
  totalSteps: number;
  completedSteps: number;
}

export const progressState = ref<ProgressState>({
  totalSteps: 0,
  completedSteps: 0,
  message: "",
  error: undefined,
});

export function progressError(error: string | undefined) {
  progressState.value.error = error;
}

export function progressToast(message: string) {
  progressState.value.message = message;
  // progressState.value.error = message;
  progressState.value.totalSteps = 1;
  progressState.value.completedSteps = 0;
  setTimeout(() => {
    progressState.value.completedSteps = 0;
    progressState.value.totalSteps = 0;
  }, 1000);
}

export function progressMessage(message: string, totalSteps?: number) {
  if (typeof totalSteps === "number") {
    progressState.value.error = undefined;
    progressState.value.completedSteps = 0;
    progressState.value.totalSteps = totalSteps;
  }

  progressState.value.completedSteps++;
  progressState.value.message = message;
}
