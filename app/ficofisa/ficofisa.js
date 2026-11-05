"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cancelOwnedEvent, changeEvent, createNewEvent, reserveASpot, getEvent, getOwnedEvent, getReservation, removeReservationGuest, withdrawReservation } from "./subcomponents/EventAdminManager/EventManager";

const reservationCookie = "ficofisa-reservation";
const creatorCookie = "ficofisa-creator";

export async function makeNewEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation) {
  const cookieStore = await cookies();
  let identity = cookieStore.get(creatorCookie)?.value;
  if (!identity || !/^[a-f0-9]{64}$/.test(identity)) {
    identity = randomBytes(32).toString("hex");
    cookieStore.set(creatorCookie, identity, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  }
  return createNewEvent(eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation, identity);
}

export async function viewMyEvent(eventId) {
  const identity = (await cookies()).get(creatorCookie)?.value;
  return getOwnedEvent(eventId, identity);
}

export async function updateMyEvent(eventId, eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation) {
  const identity = (await cookies()).get(creatorCookie)?.value;
  const result = await changeEvent(eventId, identity, eventName, eventDate, eventTime, eventDescription, eventAttendanceType, maximumAllowed, acceptedEventInformation);
  if (result.status === "updated") revalidatePath(`/${eventId}`);
  return result;
}

export async function cancelMyEvent(eventId) {
  const identity = (await cookies()).get(creatorCookie)?.value;
  const result = await cancelOwnedEvent(eventId, identity);
  if (result.status === "canceled") revalidatePath(`/${eventId}`);
  return result;
}

export async function makeANewReservation(eventId, name, guestCount) {
  const identity = (await cookies()).get(reservationCookie)?.value;
  return reserveASpot(eventId, name, guestCount, identity);
}

export async function rememberReservation(eventId) {
  const cookieStore = await cookies();
  let identity = cookieStore.get(reservationCookie)?.value;
  if (!identity || !/^[a-f0-9]{64}$/.test(identity)) {
    identity = randomBytes(32).toString("hex");
    cookieStore.set(reservationCookie, identity, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  }
  return getReservation(eventId, identity);
}

export async function withdrawMyReservation(eventId) {
  const identity = (await cookies()).get(reservationCookie)?.value;
  return withdrawReservation(eventId, identity);
}

export async function removeMyPlusOne(eventId) {
  const identity = (await cookies()).get(reservationCookie)?.value;
  return removeReservationGuest(eventId, identity);
}

export async function viewEvent(eventCode) {
  const identity = (await cookies()).get(creatorCookie)?.value;
  return getEvent(eventCode, identity);
}
