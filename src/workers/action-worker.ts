import { createMessageBus } from "@/services/actionService";
import { registerActions } from "./offscreenArtboardService";

export const messageBus = createMessageBus(self);

registerActions(messageBus);
