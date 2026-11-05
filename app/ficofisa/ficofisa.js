"use server";

import { createNewEvent, reserveASpot, getEvent } from "./subcomponents/EventAdminManager/EventManager";

export async function makeNewEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation) {
  return createNewEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation);
}

export async function makeANewReservation(eventId, name, guestCount) {
  return reserveASpot(eventId, name, guestCount);
}

export async function viewEvent(eventCode) {
  return getEvent(eventCode);
}
