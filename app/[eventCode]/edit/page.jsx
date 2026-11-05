import { notFound, redirect } from "next/navigation";
import EventForm from "../../components/EventForm/EventForm";
import { loadMyEvent } from "./api";

export default async function EditEventPage({ params }) {
  const { eventCode } = await params;
  const event = await loadMyEvent(eventCode);
  if (!event) notFound();
  if (event.canceled) redirect(`/${event.id}`);

  return <EventForm event={event} />;
}
