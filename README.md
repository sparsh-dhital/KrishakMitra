# KrishakMitra Prototype

## Run locally

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
```

The frontend uses `frontend/.env.local` for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Shared bidding across laptops

1. Open the Supabase SQL editor for the configured project.
2. Run [`supabase/bidding.sql`](supabase/bidding.sql) once.
3. Start the frontend on a reachable machine and open the displayed Vite URL from both laptops. Do not use `localhost` on the second laptop; use the host laptop's LAN IP and bind Vite to `0.0.0.0`.
4. Log in as Farmer on one device and Buyer / Institution on the other.
5. The farmer's listing is stored in `auctions`; buyer bids are stored in `bids`; bid notifications are stored in `auction_notifications` and realtime bid events update open cards.

For a same-machine demo without the migration, the app uses local demo fallback data. That fallback is intentionally not shared between laptops.