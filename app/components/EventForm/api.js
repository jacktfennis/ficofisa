import { cancelMyEvent, makeNewEvent, updateMyEvent } from "../../ficofisa/ficofisa";

export async function createEvent(...details) {
  return makeNewEvent(...details);
}

export async function updateEvent(eventId, ...details) {
  return updateMyEvent(eventId, ...details);
}

export async function cancelEvent(eventId) {
  return cancelMyEvent(eventId);
}
