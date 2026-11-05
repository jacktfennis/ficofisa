import "server-only";

import { findAttendeesByEventId, findEventById, insertAttendee, insertEvent } from "./EventDataLayer";

export async function createNewEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation) {
  return insertEvent(
    eventName,
    eventDate,
    eventTime,
    eventDescription,
    eventAttendanceType,
    maximumAllowed,
    acceptedEventInformation,
  );
}

export async function reserveASpot(eventId, name, guestCount) {
  const reservation = await insertAttendee(eventId, name.trim(), guestCount);
  return reservation
    ? { status: "reserved", acceptedEventInformation: reservation.acceptedEventInformation }
    : { status: "unavailable" };
}

export async function getEvent(eventCode) {
  const event = await findEventById(eventCode);
  if (!event) return null;

  const attendees = await findAttendeesByEventId(eventCode);
  return { ...event, attendees };
}
