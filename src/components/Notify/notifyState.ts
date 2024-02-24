import { ref } from "vue";

export interface NotifyState {
  message?: string;
  error?: string;
  totalSteps: number;
  completedSteps: number;
}

export const notifyState = ref<NotifyState>({
  totalSteps: 0,
  completedSteps: 0,
  message: "",
  error: undefined,
});

export function notifyError(error: string | undefined) {
  console.error("error:", error);
  notifyState.value.error = error;
}

// TODO needs to show, not with partial progress bar though
export function notifyToast(message: string) {
  console.log("toast:", message);
  notifyState.value.message = message;
  notifyState.value.totalSteps = 1;
  notifyState.value.completedSteps = 0;
  setTimeout(() => {
    notifyState.value.completedSteps = 0;
    notifyState.value.totalSteps = 0;
  }, 5000);
}

// TODO we need to do this different and add a notifyComplete
// TODO progress bar needs to shimmer
export function notifyProgress(message: string, totalSteps?: number) {
  console.log("progress:", message, totalSteps);
  if (typeof totalSteps === "number") {
    notifyState.value.error = undefined;
    notifyState.value.completedSteps = 0;
    notifyState.value.totalSteps = totalSteps;
  }

  notifyState.value.completedSteps++;
  notifyState.value.message = message;
}
