import { viewMyEvent } from "../../ficofisa/ficofisa";

export async function loadMyEvent(eventCode) {
  return viewMyEvent(eventCode);
}
