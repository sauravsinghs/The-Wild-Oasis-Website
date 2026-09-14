# The Wild Oasis Website

The Wild Oasis Website is the guest-facing booking application for a boutique hotel. Guests can browse cabins, view availability and pricing, create reservations, review their stays, and update their profile.

The companion <a href="https://github.com/sauravsinghs/The-Wild-Oasis" target="_blank" rel="noopener noreferrer">the-wild-oasis</a> project is the private staff dashboard. Both applications use the same Supabase project and tables, but they are independently deployable and use different authentication flows: Google/NextAuth for guests and Supabase authentication for staff.

## Features

- Cabin listings and detail pages with availability checking
- Reservation flow with date selection, guest details, and optional breakfast
- Guest account with reservation history and profile updates
- Google authentication through NextAuth
- Server Actions for booking and account mutations
- Demo mode with mock authentication and local mock data

## Tech stack

- Next.js 14 App Router and React 18
- NextAuth for guest authentication
- Supabase for database access and storage
- Tailwind CSS for styling
- date-fns and React Day Picker for date and calendar interactions
- Vercel-friendly production deployment

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is ignored and must never be committed.

3. For a local demo without external credentials, keep `MOCK_MODE=true` and start the app:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

For live Supabase data, set `MOCK_MODE=false` and provide the Supabase and NextAuth/Google values. `SUPABASE_KEY` is used by server-side code and must remain server-only; never rename it with a `NEXT_PUBLIC_` prefix.

## Production commands

```bash
npm run build
npm start
```

Deploy the website separately from the admin dashboard and configure the environment variables in the hosting provider rather than committing them to GitHub.
