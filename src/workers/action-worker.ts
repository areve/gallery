import { createMessageBus } from "@/services/actionService";
import { registerActions } from "./offscreenArtboardService";

export const messageBus = createMessageBus();
messageBus.addWorker(self);
registerActions(messageBus);
