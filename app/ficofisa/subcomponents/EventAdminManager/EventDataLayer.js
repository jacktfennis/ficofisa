import "server-only";

import { neon } from "@neondatabase/serverless";

function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(process.env.DATABASE_URL);
}

export async function insertEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation) {
  const sql = getDatabase();
  const rows = await sql`
    INSERT INTO public.events ("eventName", "eventDate", "eventTime", "eventDescription", "eventAttendanceType", "maximumAllowed", "acceptedEventInformation")
    VALUES (
      ${eventName}, ${eventDate}, ${eventTime}, ${eventDescription}, ${eventAttendanceType}, ${maximumAllowed}, ${acceptedEventInformation}
    )
    RETURNING id::text AS id
  `;
  return rows[0].id;
}

export async function insertAttendee(eventId, name, guestCount) {
  const sql = getDatabase();
  const rows = await sql`
    WITH reserved AS (
      UPDATE public.events
      SET "reservedCount" = "reservedCount" + ${guestCount}
      WHERE id = ${eventId}::bigint
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
      INSERT INTO public.attendees ("eventId", "name", "guestCount")
      SELECT id, ${name}, ${guestCount} FROM reserved
      RETURNING id
    )
    SELECT attendee.id::text AS id, reserved."acceptedEventInformation"
    FROM attendee CROSS JOIN reserved
  `;
  return rows[0] ?? null;
}

export async function findEventById(id) {
  const sql = getDatabase();
  const rows = await sql`
    SELECT "eventName",
      to_char("eventDate", 'DD/MM/YYYY') AS "eventDate",
      to_char("eventTime", 'HH12:MI AM') AS "eventTime",
      "eventDescription",
      "eventAttendanceType"
    FROM public.events
    WHERE id = ${id}::bigint
  `;
  return rows[0] ?? null;
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
