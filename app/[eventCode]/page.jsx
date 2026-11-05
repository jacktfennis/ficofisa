import { notFound } from "next/navigation";
import { viewEvent } from "../ficofisa/ficofisa";
import EventPlaceholder from "./event-placeholder";

export default async function EventPage({ params, searchParams }) {
  const { eventCode } = await params;
  const { clipboard } = await searchParams;

  const event = await viewEvent(eventCode);
  if (!event) notFound();

  return <EventPlaceholder event={event} eventCode={eventCode} clipboardUnavailable={clipboard === "unavailable"} />;
}
