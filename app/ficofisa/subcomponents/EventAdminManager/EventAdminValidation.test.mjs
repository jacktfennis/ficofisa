import assert from "node:assert/strict";
import test from "node:test";
import { isEventId, validateNewEvent } from "./EventAdminValidation.mjs";

const validEvent = {
  eventName: " Dinner ",
  eventDate: "2028-02-29",
  eventTime: "19:30",
  eventDescription: " A meal ",
  eventAttendanceType: "open",
  maximumAllowed: 2,
  limitedEventMessage: " Please RSVP ",
};

test("validates and trims every event field", () => {
  assert.deepEqual(validateNewEvent(validEvent), {
    ...validEvent,
    eventName: "Dinner",
    eventDescription: "A meal",
    limitedEventMessage: "Please RSVP",
  });
  for (const eventAttendanceType of ["open", "raw-cap", "plus-one"]) {
    assert.equal(validateNewEvent({ ...validEvent, eventAttendanceType, maximumAllowed: 20 }).eventAttendanceType, eventAttendanceType);
  }
});

test("rejects missing and invalid event fields", () => {
  for (const field of ["eventName", "eventDate", "eventTime", "eventDescription", "limitedEventMessage"]) {
    assert.throws(() => validateNewEvent({ ...validEvent, [field]: " " }));
    assert.throws(() => validateNewEvent({ ...validEvent, [field]: null }));
  }
  for (const eventDate of ["2027-02-29", "0000-01-01", "2028-13-01", "2028-1-01"]) {
    assert.throws(() => validateNewEvent({ ...validEvent, eventDate }));
  }
  for (const eventTime of ["24:00", "12:60", "7:30", "19:30:00"]) {
    assert.throws(() => validateNewEvent({ ...validEvent, eventTime }));
  }
  for (const maximumAllowed of [null, 1, 21, 2.5, "2"]) {
    assert.throws(() => validateNewEvent({ ...validEvent, maximumAllowed }));
  }
  assert.throws(() => validateNewEvent({ ...validEvent, eventAttendanceType: "limited" }));
});

test("accepts only positive Postgres bigint IDs", () => {
  for (const id of ["1", "9223372036854775807"]) {
    assert.equal(isEventId(id), true);
  }
  for (const id of ["0", "01", "-1", "1.0", "1abc", "9223372036854775808", "9".repeat(100), 1, null]) {
    assert.equal(isEventId(id), false);
  }
});
