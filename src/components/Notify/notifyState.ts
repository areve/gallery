import { ref, watch } from "vue";

export interface NotifyState {
  progress: {
    steps: number;
    complete: number;
    message: string;
    error: boolean;
    visible: boolean;
    percent: string;
  };
  toast: {
    message: string;
    error: boolean;
    visible: boolean;
  };
}

export const notifyState = ref<NotifyState>(defaultState());

watch(
  () => [notifyState.value.progress.steps, notifyState.value.progress.complete],
  () => {
    // TODO make the bar infinitely grow instead of this.
    if (notifyState.value.progress.steps === 0) {
      notifyState.value.progress.percent = "10%";
    } else {
      const fraction = notifyState.value.progress.complete / notifyState.value.progress.steps;
      notifyState.value.progress.percent = (0.1 + fraction * 0.9) * 100 + "%";
    }
  },
);
function defaultState(): NotifyState {
  return {
    progress: {
      steps: 0,
      complete: 0,
      message: "",
      error: false,
      visible: false,
      percent: "0%",
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

export function notifyProgress(message: string, steps?: number) {
  console.log("progress:", message, steps);
  notifyState.value.toast = defaultState().toast;
  notifyState.value.progress.visible = true;
  if (typeof steps === "number") {
    notifyState.value.progress.error = false;
    notifyState.value.progress.steps += steps;
  } else {
    notifyState.value.progress.complete++;
  }

  notifyState.value.progress.message = message;

  if (notifyState.value.progress.complete === notifyState.value.progress.steps) {
    setTimeout(() => {
      notifyState.value.progress.visible = false;
    }, 500);
    // TODO using timeouts is not great
    setTimeout(reset, 1000);
  }
}
