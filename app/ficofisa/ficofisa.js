"use server";

import { createNewEvent } from "./subcomponents/EventAdminManager/EventAdminManager";

export async function makeNewEvent(
  eventName,
  eventDate,
  eventTime,
  eventDescription,
  eventAttendanceType,
  maximumAllowed,
  limitedEventMessage,
) {
  return createNewEvent(
    eventName,
    eventDate,
    eventTime,
    eventDescription,
    eventAttendanceType,
    maximumAllowed,
    limitedEventMessage,
  );
}
