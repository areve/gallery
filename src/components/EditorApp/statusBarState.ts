import { ref } from "vue";
import { usePersistentState } from "@/services/persistenceService";

export const statusBarModes = ["dimenensions", "openai", "filename"] as const;
export type StatusBarMode = typeof statusBarModes[number];

export const statusbarState = ref({
  mode: "dimenensions" as StatusBarMode,
});

usePersistentState("statusbarState", statusbarState);
