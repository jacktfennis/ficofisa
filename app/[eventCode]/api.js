import { makeANewReservation, rememberReservation, removeMyPlusOne, withdrawMyReservation } from "../ficofisa/ficofisa";

export async function reserveSpot(eventCode, name, guestCount) {
  return makeANewReservation(eventCode, name, guestCount);
}

export async function loadReservation(eventCode) {
  return rememberReservation(eventCode);
}

export async function withdrawSpot(eventCode) {
  return withdrawMyReservation(eventCode);
}

export async function removePlusOne(eventCode) {
  return removeMyPlusOne(eventCode);
}
