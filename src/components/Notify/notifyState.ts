import { clone } from "@/lib/utils";
import { ref } from "vue";

export interface NotifyState {
  process: {
    steps: number;
    complete: number;
    message: string;
    error: boolean;
    visible: boolean;
  };
  toast: {
    message: string;
    error: boolean;
    visible: boolean;
  };
}

export const notifyState = ref<NotifyState>(defaultState());

function defaultState() {
  return {
    process: {
      steps: 100,
      complete: 0,
      message: "",
      error: false,
      visible: false,
    },
    toast: {
      message: "",
      error: false,
      visible: false,
    },
  };
}

function reset() {
  Object.assign(notifyState.value, defaultState());
}

export function notifyError(error: string) {
  console.error("error:", error);
  reset();
  notifyState.value.toast.message = error;
  notifyState.value.toast.error = true;
  notifyState.value.toast.visible = true;
  setTimeout(() => (notifyState.value.toast.visible = false), 5000);
}

export function notifyToast(message: string) {
  console.log("toast:", message);
  reset();
  notifyState.value.toast.message = message;
  notifyState.value.toast.visible = true;
  setTimeout(() => (notifyState.value.toast.visible = false), 5000);
}

// TODO we need to do this different and add a notifyComplete
// TODO progress bar needs to shimmer
export function notifyProgress(message: string, totalSteps?: number) {
  console.log("progress:", message, totalSteps);
  notifyState.value.toast = defaultState().toast;
  notifyState.value.process.visible = true;
  if (typeof totalSteps === "number") {
    notifyState.value.process.error = false;
    notifyState.value.process.complete = 0;
    notifyState.value.process.steps = totalSteps;
  }

  notifyState.value.process.complete++;
  notifyState.value.process.message = message;
  if (notifyState.value.process.complete === notifyState.value.process.steps) {
    setTimeout(() => {
      notifyState.value.process.visible = false;
    }, 500);
    // TODO using timeouts is not great
    setTimeout(reset, 1000);
  }
}
