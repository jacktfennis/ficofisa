import "server-only";

import { neon } from "@neondatabase/serverless";

function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(process.env.DATABASE_URL);
}

export async function insertNewEvent(event) {
  const sql = getDatabase();
  const rows = await sql`
    INSERT INTO public.events (
      "eventName", "eventDate", "eventTime", "eventDescription",
      "eventAttendanceType", "maximumAllowed", "limitedEventMessage"
    )
    VALUES (
      ${event.eventName}, ${event.eventDate}, ${event.eventTime}, ${event.eventDescription},
      ${event.eventAttendanceType}, ${event.maximumAllowed}, ${event.limitedEventMessage}
    )
    RETURNING id::text AS id
  `;

  if (!rows[0]?.id) {
    throw new Error("The event was inserted without returning an ID.");
  }

  return rows[0].id;
}

export async function findEventId(id) {
  const sql = getDatabase();
  const rows = await sql`SELECT id::text AS id FROM public.events WHERE id = ${id}::bigint`;
  return rows[0]?.id ?? null;
}
