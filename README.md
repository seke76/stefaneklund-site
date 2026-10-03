This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Whenworks (`/whenworks`)

A scheduling app at [stefaneklund.se/whenworks](https://stefaneklund.se/whenworks). It has its own root layout in `app/whenworks/`, and the main site lives in `app/(site)/`.

**Database (required in production):** In the Vercel project, open *Storage* → *Create Database* → **Upstash for Redis**, and connect it to the project. This sets the `KV_REST_API_URL` and `KV_REST_API_TOKEN` variables, or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; either pair works. Events expire after 60 days automatically. Locally, `npm run dev` uses an in-memory store when these variables are missing.

**Email (optional):** Set `RESEND_API_KEY` and `WW_EMAIL_FROM` (e.g. `Whenworks <whenworks@stefaneklund.se>`, on a domain verified in Resend) to let organizers email guests when the time is set. Without them, the email toggle is hidden.
