BEGIN;

LOCK TABLE public.events, public.attendees IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.events
    ADD COLUMN "reservedCount" INTEGER NOT NULL DEFAULT 0 CHECK ("reservedCount" >= 0);

ALTER TABLE public.attendees
    ADD COLUMN "guestCount" INTEGER NOT NULL DEFAULT 1 CHECK ("guestCount" IN (1, 2));

UPDATE public.events AS event
SET "reservedCount" = totals.guest_count
FROM (
    SELECT "eventId", SUM("guestCount")::integer AS guest_count
    FROM public.attendees
    GROUP BY "eventId"
) AS totals
WHERE event.id = totals."eventId";

COMMIT;
