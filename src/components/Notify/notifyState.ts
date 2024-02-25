import { ref, watch } from "vue";

export interface NotifyState {
  process: {
    // TODO wrong name!!!
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
  () => [notifyState.value.process.steps, notifyState.value.process.complete],
  () => {
    // TODO make the bar infinitely grow instead of this.
    if (notifyState.value.process.steps === 0) {
      notifyState.value.process.percent = "10%";
    } else {
      const fraction = notifyState.value.process.complete / notifyState.value.process.steps;
      notifyState.value.process.percent = (0.1 + fraction * 0.9) * 100 + "%";
    }
  },
);
function defaultState() {
  return {
    process: {
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

// TODO we need to do this different and add a notifyComplete
// TODO progress bar needs to shimmer
export function notifyProgress(message: string, steps?: number) {
  console.log("progress:", message, steps);
  notifyState.value.toast = defaultState().toast;
  notifyState.value.process.visible = true;
  if (typeof steps === "number") {
    notifyState.value.process.error = false;
    // notifyState.value.process.complete = 0;
    notifyState.value.process.steps += steps;
  } else {
    notifyState.value.process.complete++;
  }

  notifyState.value.process.message = message;

  if (notifyState.value.process.complete === notifyState.value.process.steps) {
    setTimeout(() => {
      notifyState.value.process.visible = false;
    }, 500);
    // TODO using timeouts is not great
    setTimeout(reset, 1000);
  }
}
