import { notFound } from "next/navigation";
import { findEventId } from "../ficofisa/subcomponents/EventAdminManager/EventAdminDataLayer";
import { isEventId } from "../ficofisa/subcomponents/EventAdminManager/EventAdminValidation.mjs";
import EventPlaceholder from "./event-placeholder";

export default async function EventPage({ params, searchParams }) {
  const { eventIdSlug } = await params;
  const { clipboard } = await searchParams;

  if (!isEventId(eventIdSlug)) notFound();

  const eventId = await findEventId(eventIdSlug);
  if (!eventId) notFound();

  return <EventPlaceholder eventId={eventId} clipboardUnavailable={clipboard === "unavailable"} />;
}
