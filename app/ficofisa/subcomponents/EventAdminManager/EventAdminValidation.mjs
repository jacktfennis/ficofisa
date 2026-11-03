function requiredText(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

export function validateNewEvent(event) {
  const eventName = requiredText(event.eventName, "Event name");
  const eventDate = requiredText(event.eventDate, "Event date");
  const eventTime = requiredText(event.eventTime, "Event time");
  const eventDescription = requiredText(event.eventDescription, "Event description");
  const limitedEventMessage = requiredText(event.limitedEventMessage, "Limited event message");

  const parsedDate = new Date(`${eventDate}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) ||
    eventDate.startsWith("0000") ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== eventDate
  ) {
    throw new Error("Event date must be a valid date.");
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(eventTime)) {
    throw new Error("Event time must be a valid time.");
  }

  if (!["open", "raw-cap", "plus-one"].includes(event.eventAttendanceType)) {
    throw new Error("Choose an event attendance type.");
  }

  if (!Number.isInteger(event.maximumAllowed) || event.maximumAllowed < 2 || event.maximumAllowed > 20) {
    throw new Error("Maximum allowed must be between 2 and 20.");
  }

  return {
    eventName,
    eventDate,
    eventTime,
    eventDescription,
    eventAttendanceType: event.eventAttendanceType,
    maximumAllowed: event.maximumAllowed,
    limitedEventMessage,
  };
}

export function isEventId(id) {
  return typeof id === "string" &&
    /^[1-9]\d{0,18}$/.test(id) &&
    BigInt(id) <= 9223372036854775807n;
}
