# Supabase setup

MedPoint's selected backend is Supabase. The starter SQL in `SUPABASE_SETUP.sql` creates pharmacy workspaces, memberships, a shared-state table, append-only audit records, and Row Level Security policies. New Supabase Auth users receive an owner workspace. The invite RPC can add a signed-in staff member using a workspace invite code.

## Configure the project

1. Create a Supabase project and run `SUPABASE_SETUP.sql` in its SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key from the Supabase dashboard.
3. Keep `.env.local` private. A publishable key is intended for browser use only alongside Row Level Security; never add a `service_role` or secret key to this Vite app.

The staff dashboard now signs in with Supabase Auth and stores its shared pharmacy snapshot in `workspace_state`. On the first visit to an empty workspace, the owner chooses either to start empty or explicitly copy the current browser's records. The copy option leaves the original browser data in place. No local customer, staff, inventory, or sales data is uploaded automatically.

The staff invite code is visible to workspace owners and managers in the signed-in dashboard. Staff create/sign in to an account and use that code to join the workspace. The current staff app writes one JSONB snapshot per workspace; refresh another device to load the latest snapshot. This starter sync does not merge simultaneous edits or make billing/stock updates transaction-safe. The `audit_events` table is available under RLS; the existing UI audit list is stored in the workspace snapshot.

## Customer phone OTP

The shop now calls Supabase Phone Auth to request and verify customer OTPs. Before customers use it:

1. Run `SUPABASE_CUSTOMER_AUTH.sql` once in the Supabase SQL Editor. It prevents new customer accounts from receiving an owner pharmacy workspace.
2. In Supabase, enable Phone sign-in under Authentication → Sign In / Providers and configure a supported SMS provider with its credentials.
3. Run `SUPABASE_CUSTOMER_ORDERS.sql` once in the Supabase SQL Editor to create the customer order-request backend and its access policies.
4. Sign in to `/staff` as the pharmacy owner or manager, open **Customer orders**, and select **Enable online orders**. Only one workspace can serve the public shop in this starter app.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to Vercel's Environment Variables and redeploy. Use the same Supabase project where the migration and Phone Auth settings were configured.

Customers must sign in with a verified phone number before sending a request. Requests are stored in Supabase and appear in the staff **Customer orders** page. A pharmacist, manager, or owner can confirm or decline them; the customer confirmation page checks for status changes every 15 seconds.

This is a request-and-review flow, not a payment or stock reservation system. Product catalogue prices and stock shown by the shop are sample estimates; staff must check inventory and agree the final price and delivery before confirming. No payment is collected online, and confirming a request does not deduct stock from the workspace snapshot. Prescription-only products cannot be requested online.

The customer session uses separate browser storage so customer sign-in does not replace the owner's or staff member's MedPoint workspace session.
