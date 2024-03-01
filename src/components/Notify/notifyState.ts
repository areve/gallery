import { ref } from "vue";

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

let progressInterval: NodeJS.Timeout | undefined;
let currentWidth: number = 0;
const progressExtraSteps = 2;
const framesPerSecond = 30;

export const notifyState = ref<NotifyState>(defaultState());

export const wrapUpTimeSeconds = 0.4;
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
  currentWidth = 0;
  clearInterval(progressInterval);
  progressInterval = undefined;
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
    if (!progressInterval) progressInterval = setInterval(updatePercent, 1000 / framesPerSecond);
    notifyState.value.progress.error = false;
    notifyState.value.progress.steps += steps;
  } else {
    notifyState.value.progress.complete++;
  }

  notifyState.value.progress.message = message;
}

function updatePercent() {
  if (notifyState.value.progress.complete >= notifyState.value.progress.steps) {
    currentWidth += 1 / framesPerSecond / wrapUpTimeSeconds;
    if (currentWidth >= 1) {
      currentWidth = 1;
      notifyState.value.progress.visible = false;
      setTimeout(reset, wrapUpTimeSeconds * 1000);
    }
  } else {
    const fraction = (notifyState.value.progress.complete + progressExtraSteps) / (notifyState.value.progress.steps + progressExtraSteps);
    const diff = fraction - currentWidth;
    currentWidth += diff / 60;
  }
  notifyState.value.progress.percent = currentWidth * 100 + "%";
}
