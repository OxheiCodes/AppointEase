# AppointEase Now

## Overview
AppointEase Now is a booking SaaS for small businesses to manage appointments and reduce scheduling conflicts.

Stage 1 delivers a clean, responsive UI shell and a scalable full-stack project setup using React (Vite) and Express.

Stage 2 adds Supabase authentication, role management, and database schema foundations.

Stage 3 adds booking core APIs, double-booking protection, and a booking UI with slot availability.

Stage 4 adds a business-owner dashboard with daily filtering, cancellation controls, and quick stats.

Stage 5 adds a public customer booking experience with a simple 3-step flow and confirmation screen.

Stage 6 adds automated testing, bug fixing, and a consolidated testing report.

Stage 7 adds full deployment setup using only free services: Vercel, Render, and Supabase.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database/Auth (next stages): Supabase (free tier)
- Deployment (later stages): Vercel (frontend), Render (backend)

## Features
- Responsive landing dashboard shell
- Navigation bar with primary sections
- Placeholder cards for Bookings, Calendar, Clients
- Express API starter with health endpoint
- Scalable folder structure for components, services, and routes
- Supabase authentication pages (signup/login/logout)
- Role system with `business_owner` and `customer`
- Supabase schema for `users` and `appointments` tables
- Booking API endpoints for create, list, and cancel appointments
- Slot availability selector to help prevent booking conflicts
- Business-owner booking dashboard view
- Owner dashboard with date filters and booking stats cards
- Public booking page with guided 3-step flow for guests
- Automated backend and frontend tests with bug-fix coverage
- Deployment-ready configs for Vercel and Render (free tier)
- Single role-aware dashboard link that routes customers and owners to the right page

## Color System
- Deep Red: #780000
- Alert Red: #c1121f
- Cream: #fdf0d5
- Navy: #003049
- Steel Blue: #669bbc

## Setup Instructions
### 1) Clone and install dependencies
Run these commands from the project root:

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 2) Configure backend environment
In the backend folder, create a .env file using backend/.env.example:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3) Configure frontend environment
In the frontend folder, create a .env file using frontend/.env.example:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### 4) Supabase free-tier setup
1. Create a free Supabase project.
2. In Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql).
3. In Authentication > Providers, keep Email enabled.
4. In Authentication > URL Configuration, add `http://localhost:5173`.

This creates:
- `users` table with role support (`business_owner`, `customer`)
- `appointments` table with fields required for Stage 2+
- Trigger to auto-create a `users` profile row from signup metadata
- Basic Row Level Security policies

For Stage 3, also make sure your database has the unique index that blocks duplicate active slots.
If you already ran the SQL before this Stage 3 update, re-run [supabase/schema.sql](supabase/schema.sql) so the index is created.

For Stage 5, re-run [supabase/schema.sql](supabase/schema.sql) to add guest booking fields in `appointments` (`guest_name`, `guest_email`) and the booking identity check constraint.

### 5) Frontend API base URL
In `frontend/.env`, optionally set:

```env
VITE_API_URL=http://localhost:5000
```

If omitted, the app defaults to `http://localhost:5000`.

### 6) Run frontend and backend locally
Use two terminals:

Terminal A (frontend):

```bash
cd frontend
npm run dev
```

Terminal B (backend):

```bash
cd backend
npm run dev
```

Default local URLs:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Testing Instructions
### Manual Stage 1 checklist
- Frontend starts without errors
- Navbar is visible with brand and nav links
- Hero section text renders correctly
- Three placeholder cards are visible: Bookings, Calendar, Clients
- Layout adapts on mobile width (<= 640px)
- Backend starts without errors
- Health endpoint returns status ok JSON

### Manual Stage 2 checklist
- Can user sign up from `/auth/signup` with role `customer`
- Can user sign up from `/auth/signup` with role `business_owner`
- Signup should complete without waiting for email confirmation (handled by backend register endpoint)
- Can user login from `/auth/login`
- Can user logout from `/auth/account`
- Logged-in account page shows the correct role pulled from the `users` table

### Manual Stage 3 checklist
- Create one `business_owner` account and one `customer` account.
- Login as customer and open `/bookings`.
- Select a business owner, date, and available time slot.
- Click `Book Appointment` and verify the booking appears in the list.
- In a second customer session, try booking the same business + date + time: it must fail with a conflict message.
- Login as business owner and open `/bookings`: owner should see all bookings for their business.
- Cancel an appointment and verify its status changes to `cancelled`.
- Confirm mobile responsiveness for `/bookings` at narrow widths.

### Manual Stage 4 checklist
- Login as a `business_owner` and open `/owner-dashboard`.
- Confirm stats cards show:
	- total bookings today
	- total upcoming bookings
- Use the date filter and verify only appointments from that date are shown.
- Click cancel on an active appointment and verify the status updates to `cancelled`.
- Check dashboard layout on mobile width and ensure cards stack cleanly.

### Navigation check
- Open the top nav and confirm there is one `Dashboard` link instead of separate `Bookings` and `Owner Dashboard` links.
- Confirm customers are sent to `/bookings` and business owners are sent to `/owner-dashboard`.

### Manual Stage 5 checklist
- Open `/public-booking` without logging in.
- Step 1: Select a business and continue.
- Step 2: Choose date and available time slot.
- Step 3: Enter guest name + email and confirm booking.
- Verify confirmation screen appears after submit.
- Repeat booking with same business/date/time and verify conflict message appears.
- Confirm mobile usability of all 3 steps and buttons.

### Automated Stage 6 tests
Backend (Jest):

```bash
cd backend
npm test
```

Frontend (Vitest + React Testing Library):

```bash
cd frontend
npm test
```

### Manual Stage 6 checklist
- Re-run [supabase/schema.sql](supabase/schema.sql) to ensure latest guest/RLS policy updates are applied.
- Validate customer booking conflict behavior still returns conflict for same slot.
- Validate guest booking works from `/public-booking` without authentication.
- Validate owner dashboard cancellation still works from `/owner-dashboard`.
- Validate mobile navigation does not overflow on small screens.

### Stage 6 Testing Report
- Backend unit tests: 2 passed, 0 failed.
- Frontend component tests: 2 passed, 0 failed.
- Frontend production build: passed.

### Stage 6 Fixed Issues List
- Fixed RLS policy issue blocking guest bookings under public flow.
- Preserved booking conflict protection while allowing valid guest inserts.
- Improved mobile navigation responsiveness to prevent link crowding/overflow.

## Deployment Guide
This project is deployed using only free services:
- Frontend: Vercel (free tier)
- Backend: Render Web Service (free tier)
- Database/Auth: Supabase (free tier)

### 1) Supabase production setup (free tier)
1. Open your Supabase project dashboard.
2. Run [supabase/schema.sql](supabase/schema.sql) in SQL Editor to ensure latest schema, constraints, and policies are active.
3. In Authentication settings:
	- Keep Email provider enabled.
	- Add your Vercel frontend URL to Redirect URLs/Site URL.
4. Copy these values from Supabase Project Settings > API:
	- Project URL
	- anon public key
	- service_role key

### 2) Deploy backend to Render (free tier)
Option A (recommended):
1. Connect GitHub repo in Render.
2. Use Blueprint deployment from [render.yaml](render.yaml).
3. Set required environment variables in Render service settings:
	- FRONTEND_URL = your Vercel URL (set after frontend deploy, then update)
	- SUPABASE_URL = your Supabase Project URL
	- SUPABASE_SERVICE_ROLE_KEY = your Supabase service role key
4. Deploy and wait for service health check on /api/health.

Option B (manual Render service):
1. Create a new Web Service from repo.
2. Root Directory: backend
3. Build Command: npm install
4. Start Command: npm start
5. Plan: Free
6. Add the same env vars listed above.

### 3) Deploy frontend to Vercel (free tier)
1. Import GitHub repo in Vercel.
2. Set Root Directory to frontend.
3. Framework preset: Vite.
4. Confirm [frontend/vercel.json](frontend/vercel.json) exists for SPA routing rewrites.
5. Add frontend environment variables in Vercel:
	- VITE_SUPABASE_URL = your Supabase Project URL
	- VITE_SUPABASE_ANON_KEY = your Supabase anon public key
	- VITE_API_URL = your Render backend URL (for example, https://appointease-now-api.onrender.com)
6. Deploy.

### 4) Final cross-service wiring
1. Copy your Vercel production URL.
2. Update Render env var FRONTEND_URL with that Vercel URL.
3. Redeploy backend on Render.
4. In Supabase Authentication URL settings, confirm Vercel URL is added.

### 5) Production verification checklist
1. Open frontend production URL.
2. Test signup/login/logout.
3. Test authenticated booking flow at /bookings.
4. Test owner dashboard at /owner-dashboard.
5. Test public flow at /public-booking.
6. Verify duplicate-slot booking is blocked.
7. Verify backend health endpoint returns ok.

### Final Live URLs (placeholders)
- Frontend (Vercel): https://your-vercel-app-url.vercel.app
- Backend (Render): https://your-render-service-url.onrender.com
- Backend health: https://your-render-service-url.onrender.com/api/health

## Progress Log
### Stage 7 - Deployment (Completed: 2026-04-01)
- Added Render deployment blueprint config: [render.yaml](render.yaml)
- Added Vercel SPA rewrite config: [frontend/vercel.json](frontend/vercel.json)
- Documented full free-tier deployment workflow for:
	- Supabase configuration
	- Render backend deployment
	- Vercel frontend deployment
- Added production environment variable mapping for both services.
- Added production verification checklist and final live URL placeholders.

### Stage 6 - Testing + Bug Fixing (Completed: 2026-04-01)
- Added backend unit tests using Jest:
	- duplicate-slot conflict protection
	- guest booking creation path
- Added frontend component tests with React Testing Library:
	- complete 3-step public booking flow
	- validation on missing step-1 business selection
- Integrated test tooling/scripts in both apps (`npm test`).
- Fixed critical auth/RLS bug for public guest booking inserts.
- Improved mobile UI responsiveness for navigation links.
- Executed full Stage 6 test run and recorded report.

### Stage 5 - Customer Experience UI (Completed: 2026-04-01)
- Added public booking backend endpoints (no login required):
	- `GET /api/public/businesses`
	- `GET /api/public/availability?businessId=...&date=...`
	- `POST /api/public/appointments`
- Extended appointment logic to support guest bookings with validation:
	- guest bookings require `guestName` and `guestEmail`
	- conflict prevention still enforced for duplicate slots
- Updated schema to support guest bookings in `appointments`:
	- `user_id` can be null for guest bookings
	- added `guest_name` and `guest_email`
	- added constraint to ensure either authenticated user or guest identity is present
- Built public 3-step booking page at `/public-booking`:
	- Step 1: Select business
	- Step 2: Choose date and available slot
	- Step 3: Confirm details and submit
- Added final confirmation screen with clear success feedback.
- Added responsive styling for the public flow and navigation shortcut (`Book Now`).

### Stage 4 - Business Dashboard (Completed: 2026-04-01)
- Built a dedicated business-owner dashboard page at `/owner-dashboard`.
- Added role-aware access handling:
	- Owners can access dashboard
	- Non-owners are redirected to booking page
- Implemented date filtering for daily appointments.
- Added cancellation control from dashboard list.
- Added dashboard stats cards:
	- total bookings today
	- total upcoming bookings
- Applied clean SaaS styling with steel blue accent cards and responsive layout.

### Stage 3 - Booking System Core Logic (Completed: 2026-04-01)
- Implemented backend appointment APIs:
	- `POST /api/appointments` (create appointment)
	- `GET /api/appointments` (list bookings by user role)
	- `DELETE /api/appointments/:id` (cancel appointment)
- Added availability endpoint:
	- `GET /api/appointments/availability?businessId=...&date=...`
- Added business listing endpoint for booking UI:
	- `GET /api/businesses`
- Added auth middleware for protected API access using Supabase tokens.
- Implemented critical double-booking prevention:
	- API-level conflict check before insert
	- DB-level unique partial index on `(business_id, date, time)` for active bookings
- Built frontend booking experience at `/bookings`:
	- Customer booking form
	- Available slot selector
	- Booking list and cancel action
	- Business-owner bookings view
- Updated styles for responsive booking cards and lists.

### Stage 2 - Database + Auth (Completed: 2026-04-01)
- Integrated Supabase client in frontend services.
- Added authentication flow:
  - Sign up with role selection (`customer` or `business_owner`)
  - Login
  - Logout
- Added authenticated account page showing user email and stored role.
- Added route-based auth UI pages:
  - `/auth/signup`
  - `/auth/login`
  - `/auth/account`
- Added Supabase schema in [supabase/schema.sql](supabase/schema.sql):
  - `users` table
  - `appointments` table
  - trigger for automatic profile creation on signup
  - basic RLS policies
- Added frontend and backend environment templates for Supabase keys.

### Stage 1 - Project Setup + UI Shell (Completed: 2026-04-01)
- Created full monorepo-style structure with frontend and backend folders.
- Set up React + Vite frontend with reusable components:
  - Navbar
  - Landing dashboard shell
  - Placeholder feature cards (Bookings, Calendar, Clients)
- Implemented responsive, minimalist SaaS UI using the required color system.
- Set up Express backend with starter app, server bootstrap, and health route.
- Added project hygiene files and service placeholders for upcoming stages.
- Added local setup/run instructions and a manual Stage 1 testing checklist.

