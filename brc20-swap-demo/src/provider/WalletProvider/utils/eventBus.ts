import { EventEmitter } from "events";

export enum EventType {
  emit_disconnect_wallet = "emit_disconnect_wallet",
  on_session_invalid = "on_session_invalid",
}

export const eventBus = new EventEmitter();
