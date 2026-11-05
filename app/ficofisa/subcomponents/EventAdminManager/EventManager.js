import "server-only";

import { createHash } from "node:crypto";
import { cancelEventById, deleteAttendee, findAttendeesByEventId, findEventById, findOwnedEventById, findReservation, insertAttendee, insertEvent, removeAttendeeGuest, updateEvent } from "./EventDataLayer";

function reservationKey(identity) {
  if (typeof identity !== "string" || !/^[a-f0-9]{64}$/.test(identity)) {
    throw new Error("Reservation identity is unavailable.");
  }
  return createHash("sha256").update(identity).digest("hex");
}

function creatorKey(identity) {
  return typeof identity === "string" && /^[a-f0-9]{64}$/.test(identity)
    ? createHash("sha256").update(identity).digest("hex")
    : null;
}

function validateEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation) {
  const date = typeof eventDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(eventDate)
    ? new Date(`${eventDate}T00:00:00Z`)
    : new Date(NaN);
  if (typeof eventName !== "string" || !eventName.trim()
    || typeof eventDescription !== "string" || !eventDescription.trim()
    || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== eventDate
    || typeof eventTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(eventTime)
    || !["open", "raw-cap", "plus-one"].includes(eventAttendanceType)
    || (acceptedEventInformation !== null && typeof acceptedEventInformation !== "string")
    || (eventAttendanceType === "open" && maximumAllowed !== null)
    || (eventAttendanceType !== "open" && (!Number.isInteger(maximumAllowed) || maximumAllowed < 2 || maximumAllowed > 20
      || typeof acceptedEventInformation !== "string" || !acceptedEventInformation.trim()))) {
    throw new Error("Invalid event details.");
  }
}

export async function createNewEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation, identity) {
  const key = creatorKey(identity);
  if (!key) throw new Error("Creator identity is unavailable.");
  validateEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation);
  return insertEvent(
    eventName,
    eventDate,
    eventTime,
    eventDescription,
    eventAttendanceType,
    maximumAllowed,
    acceptedEventInformation,
    key,
  );
}

export async function getOwnedEvent(eventId, identity) {
  const key = creatorKey(identity);
  return key ? findOwnedEventById(eventId, key) : null;
}

export async function changeEvent(eventId, identity, eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation) {
  const key = creatorKey(identity);
  if (!key) return { status: "unavailable" };
  validateEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation);
  const updated = await updateEvent(eventId, key, eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation);
  return { status: updated ? "updated" : "unavailable" };
}

export async function cancelOwnedEvent(eventId, identity) {
  const key = creatorKey(identity);
  if (!key) return { status: "unavailable" };
  const canceled = await cancelEventById(eventId, key);
  return { status: canceled ? "canceled" : "unavailable" };
}

export async function reserveASpot(eventId, name, guestCount, identity) {
  const key = reservationKey(identity);
  if (typeof name !== "string" || !name.trim() || name.trim().length > 200 || ![1, 2].includes(guestCount)) {
    return { status: "invalid" };
  }

  const existing = await findReservation(eventId, key);
  if (existing) return { status: "reserved", ...existing };

  let reservation;
  try {
    reservation = await insertAttendee(eventId, name.trim(), guestCount, key);
  } catch (error) {
    if (error.code !== "23505" || error.constraint !== "attendees_event_reservation_key") throw error;
    reservation = await findReservation(eventId, key);
    if (!reservation) throw error;
  }
  if (!reservation) {
    reservation = await findReservation(eventId, key);
  }
  return reservation ? { status: "reserved", ...reservation } : { status: "unavailable" };
}

export async function getReservation(eventId, identity) {
  const reservation = await findReservation(eventId, reservationKey(identity));
  return reservation ? { status: "reserved", ...reservation } : { status: "available" };
}

export async function removeReservationGuest(eventId, identity) {
  const key = reservationKey(identity);
  const reservation = await removeAttendeeGuest(eventId, key) ?? await findReservation(eventId, key);
  return reservation ? { status: "reserved", ...reservation } : { status: "not-found" };
}

export async function withdrawReservation(eventId, identity) {
  const deleted = await deleteAttendee(eventId, reservationKey(identity));
  return { status: deleted ? "withdrawn" : "not-found" };
}

export async function getEvent(eventCode, identity) {
  const event = await findEventById(eventCode, creatorKey(identity));
  if (!event) return null;

  const attendees = await findAttendeesByEventId(eventCode);
  return { ...event, attendees };
}
