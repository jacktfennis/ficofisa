import "server-only";

import { neon } from "@neondatabase/serverless";

function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(process.env.DATABASE_URL);
}

export async function insertEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation, creatorKey) {
  const sql = getDatabase();
  const rows = await sql`
    INSERT INTO public.events ("eventName", "eventDate", "eventTime", "eventDescription", "eventAttendanceType", "maximumAllowed", "acceptedEventInformation", "creatorKeyHash")
    VALUES (
      ${eventName}, ${eventDate}, ${eventTime}, ${eventDescription}, ${eventAttendanceType}, ${maximumAllowed}, ${acceptedEventInformation}, ${creatorKey}
    )
    RETURNING id::text AS id
  `;
  return rows[0].id;
}

export async function insertAttendee(eventId, name, guestCount, reservationKey) {
  const sql = getDatabase();
  const rows = await sql`
    WITH reserved AS (
      UPDATE public.events
      SET "reservedCount" = "reservedCount" + ${guestCount}
      WHERE id = ${eventId}::bigint
        AND NOT "canceled"
        AND (
          ("eventAttendanceType" = 'open' AND ${guestCount} = 1)
          OR ("eventAttendanceType" = 'raw-cap' AND ${guestCount} = 1
            AND "reservedCount" + ${guestCount} <= "maximumAllowed")
          OR ("eventAttendanceType" = 'plus-one'
            AND "reservedCount" + ${guestCount} <= "maximumAllowed")
        )
      RETURNING id, "acceptedEventInformation"
    ),
    attendee AS (
      INSERT INTO public.attendees ("eventId", "name", "guestCount", "reservationKeyHash")
      SELECT id, ${name}, ${guestCount}, ${reservationKey} FROM reserved
      RETURNING "name", "guestCount"
    )
    SELECT attendee."name", attendee."guestCount", reserved."acceptedEventInformation"
    FROM attendee CROSS JOIN reserved
  `;
  return rows[0] ?? null;
}

export async function findReservation(eventId, reservationKey) {
  const sql = getDatabase();
  const rows = await sql`
    SELECT attendee."name", attendee."guestCount", event."acceptedEventInformation"
    FROM public.attendees AS attendee
    JOIN public.events AS event ON event.id = attendee."eventId"
    WHERE attendee."eventId" = ${eventId}::bigint
      AND attendee."reservationKeyHash" = ${reservationKey}
  `;
  return rows[0] ?? null;
}

export async function removeAttendeeGuest(eventId, reservationKey) {
  const sql = getDatabase();
  const rows = await sql`
    WITH event_lock AS (
      SELECT id FROM public.events WHERE id = ${eventId}::bigint FOR UPDATE
    ),
    updated AS (
      UPDATE public.attendees AS attendee
      SET "guestCount" = 1
      FROM event_lock
      WHERE attendee."eventId" = event_lock.id
        AND attendee."reservationKeyHash" = ${reservationKey}
        AND attendee."guestCount" = 2
      RETURNING attendee."eventId", attendee."name", attendee."guestCount"
    )
    UPDATE public.events AS event
    SET "reservedCount" = event."reservedCount" - 1
    FROM updated
    WHERE event.id = updated."eventId"
    RETURNING updated."name", updated."guestCount", event."acceptedEventInformation"
  `;
  return rows[0] ?? null;
}

export async function deleteAttendee(eventId, reservationKey) {
  const sql = getDatabase();
  const rows = await sql`
    WITH event_lock AS (
      SELECT id FROM public.events WHERE id = ${eventId}::bigint FOR UPDATE
    ),
    deleted AS (
      DELETE FROM public.attendees AS attendee
      USING event_lock
      WHERE attendee."eventId" = event_lock.id
        AND attendee."reservationKeyHash" = ${reservationKey}
      RETURNING attendee."eventId", attendee."guestCount"
    )
    UPDATE public.events AS event
    SET "reservedCount" = event."reservedCount" - deleted."guestCount"
    FROM deleted
    WHERE event.id = deleted."eventId"
    RETURNING event.id
  `;
  return rows.length > 0;
}

export async function findEventById(id, creatorKey) {
  const sql = getDatabase();
  const rows = await sql`
    SELECT id::text AS id, "eventName",
      to_char("eventDate", 'DD/MM/YYYY') AS "eventDate",
      to_char("eventTime", 'HH12:MI AM') AS "eventTime",
      "eventDescription",
      "eventAttendanceType",
      "maximumAllowed",
      "reservedCount",
      "canceled",
      COALESCE("creatorKeyHash" = ${creatorKey}, FALSE) AS "isCreator"
    FROM public.events
    WHERE id = ${id}::bigint
  `;
  return rows[0] ?? null;
}

export async function findOwnedEventById(id, creatorKey) {
  const sql = getDatabase();
  const rows = await sql`
    SELECT id::text AS id, "eventName",
      to_char("eventDate", 'YYYY-MM-DD') AS "eventDate",
      to_char("eventTime", 'HH24:MI') AS "eventTime",
      "eventDescription", "eventAttendanceType", "maximumAllowed",
      "acceptedEventInformation", "reservedCount", "canceled"
    FROM public.events
    WHERE id = ${id}::bigint AND "creatorKeyHash" = ${creatorKey}
  `;
  return rows[0] ?? null;
}

export async function updateEvent(id, creatorKey, eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation) {
  const sql = getDatabase();
  const rows = await sql`
    UPDATE public.events
    SET "eventName" = ${eventName}, "eventDate" = ${eventDate}, "eventTime" = ${eventTime},
      "eventDescription" = ${eventDescription}, "eventAttendanceType" = ${eventAttendanceType},
      "maximumAllowed" = ${maximumAllowed}, "acceptedEventInformation" = ${acceptedEventInformation}
    WHERE id = ${id}::bigint AND "creatorKeyHash" = ${creatorKey} AND NOT "canceled"
      AND (${eventAttendanceType} = 'open' OR "reservedCount" <= ${maximumAllowed})
      AND ("eventAttendanceType" <> 'plus-one' OR ${eventAttendanceType} = 'plus-one' OR "reservedCount" = 0)
    RETURNING id
  `;
  return rows.length > 0;
}

export async function cancelEventById(id, creatorKey) {
  const sql = getDatabase();
  const rows = await sql`
    UPDATE public.events SET "canceled" = TRUE
    WHERE id = ${id}::bigint AND "creatorKeyHash" = ${creatorKey} AND NOT "canceled"
    RETURNING id
  `;
  return rows.length > 0;
}

export async function findAttendeesByEventId(eventId) {
  const sql = getDatabase();
  return sql`
    SELECT id::text AS id, "name", "guestCount"
    FROM public.attendees
    WHERE "eventId" = ${eventId}::bigint
    ORDER BY id
  `;
}
