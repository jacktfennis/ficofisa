import "server-only";

import { insertNewEvent } from "./EventAdminDataLayer";
import { validateNewEvent } from "./EventAdminValidation.mjs";

export async function createNewEvent(
  eventName,
  eventDate,
  eventTime,
  eventDescription,
  eventAttendanceType,
  maximumAllowed,
  limitedEventMessage,
) {
  const event = validateNewEvent({
    eventName,
    eventDate,
    eventTime,
    eventDescription,
    eventAttendanceType,
    maximumAllowed,
    limitedEventMessage,
  });

  return insertNewEvent(event);
}
