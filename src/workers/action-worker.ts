import { bindMessages, getDispatch } from "@/services/actionService";
import type { ActionRegistry } from "../interfaces/Action";
import { registerActions } from "./offscreenArtboardService";

const actions: ActionRegistry = {};
export const dispatch = getDispatch(self);
bindMessages(self, actions);

registerActions(actions);
