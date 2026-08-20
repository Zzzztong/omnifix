# OmniFix

A home-repair service booking platform, built for a family member's local
handyman/repair business — plumbing, electrical, HVAC, appliance repair,
painting, cleaning, landscaping, and pest control.

## What it does

- **Customer app** — browse services by category, check technician
  availability, book and pay for an appointment, leave a review afterward.
- **Admin app** — manage the service catalog, assign technicians to
  incoming orders, track order status, and manage coupons/referral codes.
- **AI booking assistant** — a chat-based assistant (built on Claude's
  tool-use / function-calling) that lets a customer ask in plain language
  what services are available and when, and check open time slots, instead
  of clicking through a category browser.

## Architecture

- `backend/` — Express + TypeScript API, PostgreSQL via Prisma. JWT auth
  with role-based access (customer vs. admin), full order lifecycle
  (`PENDING → CONFIRMED → IN_PROGRESS → COMPLETED/CANCELLED`), technician
  assignment and ratings, a coupon/referral system, and the AI assistant
  route.
- `customer-app/` — React customer-facing booking flow.
- `admin-app/` — React admin dashboard for order and technician management.

## Data model (Prisma)

`User` (customer or admin, with referral codes and credits) → `Order` →
`Service` (under a `Category`) and optionally an assigned `Technician`,
with a `Review` after completion and support for `Coupon` codes
(new-user, referral, seasonal, general).
