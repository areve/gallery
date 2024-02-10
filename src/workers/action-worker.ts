import { createMessageBus } from "@/services/actionService";
import { registerActions } from "./offscreenArtboardService";

console.log("hello from worker#1");

export const messageBus = createMessageBus(self);

registerActions(messageBus);
export {};
console.log("hello from worker#2");
