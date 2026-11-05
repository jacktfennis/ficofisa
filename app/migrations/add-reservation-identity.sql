BEGIN;

ALTER TABLE public.attendees
    ADD COLUMN "reservationKeyHash" TEXT,
    ADD CONSTRAINT attendees_event_reservation_key UNIQUE ("eventId", "reservationKeyHash");

COMMIT;
