import { makeANewReservation } from "../ficofisa/ficofisa";

export async function reserveSpot(eventCode, name, guestCount) {
  return makeANewReservation(eventCode, name, guestCount);
}
