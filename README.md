This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). UI components and styling use [Ant Design](https://ant.design/).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The development server uses Next.js Fast Refresh: save changes to the app's
components or styles and the browser updates automatically. React state is
preserved when possible, though some changes require a full page reload.
The server must remain running; `npm run start` serves a production build and
does not provide Fast Refresh. Restart the development server after changing
configuration such as `next.config.mjs` or environment variables.

The event form is [app/components/EventForm/EventForm.jsx](app/components/EventForm/EventForm.jsx), rendered from `app/page.jsx`.
The shared Ant Design theme in [app/antd-provider.jsx](app/antd-provider.jsx)
uses the app's teal, purple, blue, rose, and green color palette.
The Ficofisa artwork in [public/ficofisa.png](public/ficofisa.png) is used for
the browser favicon and app icons.

## Event storage

Set `DATABASE_URL` to the Neon Postgres connection string in `.env.local` for
local development. Vercel supplies this variable to the connected production
and development environments; restart the development server after adding it.
The table definition is in [app/schema.sql](app/schema.sql). For an existing
database, run [the reservation migration](app/migrations/add-reservation-counts.sql)
once before deploying this version. It counts existing attendees as one person
each and locks both tables while it initializes the reservation counts.
Then run [the reservation identity migration](app/migrations/add-reservation-identity.sql)
once to enable remembered RSVPs and withdrawal, followed by
[the event management migration](app/migrations/add-event-management.sql) once
to enable creator access and cancellation. New databases created from the
current schema do not need these migrations.

The event name, date, time, and description are required. The accepted event
information field is always visible and optional for open events; it and the
attendance limit are required for limited events. Saving creates an event, copies its ID when clipboard
access is available, and opens `/<event-id>`. The event page shows the saved
event details and offers a manual copy option if clipboard access fails. RSVP
saves a reservation, and accepted event information is returned after a
successful reservation. Limited event capacity
counts people, and guests at plus-one events may reserve either one or two
spots. A full event shows a disabled "Event Full" button and rejects additional
reservations; existing guests can still manage their RSVPs. The event page shows the
number of spots filled and, for limited events, the total capacity; a plus-one
counts as a second spot. Open events show the filled count without a limit.
Reservations are saved by name; the event page displays RSVP names and plus-one
reservations to anyone with the event ID. A persistent, HTTP-only browser cookie remembers an RSVP per
event, restores its confirmation and accepted event information on reload, and
allows it to be withdrawn. Guests who reserved a plus-one can remove that guest
without withdrawing their own RSVP, freeing one spot. Withdrawing frees all
spots in that reservation. Both actions take effect immediately without a
confirmation dialog. The spot count and RSVP list refresh after changes, on
reload, and when returning to the tab.
Successful RSVP submissions show a brief confetti celebration, unless the
visitor prefers reduced motion. Restoring an existing RSVP does not replay it.
Existing RSVPs made before the identity migration cannot be associated with a
browser or withdrawn this way. This is not an account or a guarantee of one RSVP
per person: clearing cookies, using a different browser or device, or using
private browsing creates a separate identity. Losing the cookie also loses the
ability to withdraw that RSVP. Accepted event information is not fully
access-controlled: anyone with the event ID can reserve an available spot.
Events are not sent to recipients yet. There is currently no
authentication, so anyone who can access the application can create events.

For events created after the event management migration, the creating browser
can use **Manage event** on the event page to edit its details or cancel it.
The creator identity is remembered in an HTTP-only browser cookie, separate from
the RSVP cookie. Clearing that cookie or switching browsers or devices loses
management access; existing events cannot be attributed retroactively because
their creators were not recorded. Anyone with access to the creating browser
can manage its events. A canceled event remains visible with a cancellation
notice and no longer accepts new RSVPs. Cancellation is permanent, retains the
existing RSVP list, and does not send notifications. Changes also do not notify
attendees. An attendance cap cannot be reduced below the number of reserved
spots, and a plus-one event cannot be changed to another attendance type while
it has RSVPs. Existing reservations are preserved when an event is edited.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
