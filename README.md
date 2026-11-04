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

The welcome page is [app/welcome.jsx](app/welcome.jsx), rendered from `app/page.jsx`.
The shared Ant Design theme in [app/antd-provider.jsx](app/antd-provider.jsx)
uses the app's teal, purple, blue, rose, and green color palette.

## Event storage

Set `DATABASE_URL` to the Neon Postgres connection string in `.env.local` for
local development. Vercel supplies this variable to the connected production
and development environments; restart the development server after adding it.
The table definition is in [app/schema.sql](app/schema.sql).

All event fields are required, including the maximum allowed and limited-event
message for open events. Saving creates an event, copies its ID when clipboard
access is available, and opens `/<event-id>`. The event page is currently a
placeholder and offers a manual copy option if clipboard access fails. Events
are not sent to recipients yet. There is currently no authentication, so anyone
who can access the application can create events.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
