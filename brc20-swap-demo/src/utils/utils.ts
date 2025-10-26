import { Buffer } from "buffer";
import { message } from "antd";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function stringToHex(stringToEncode: string) {
  return Buffer.from(stringToEncode).toString("hex");
}

export function handleError(e: any) {
  return message.error((e && e.message) || e);
}
