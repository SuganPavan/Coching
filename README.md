# Bright Future Academy — Coaching Institute Management System

A full-stack coaching institute management system for Class XI & XII students built with Next.js 15, TypeScript, Tailwind CSS, MongoDB, Auth.js, Cloudinary, and Razorpay.

## Features

- **Public website** — Home, About, Courses, Faculty, Gallery, Contact, with an enquiry form. No student login.
- **Admin panel** (`/admin/dashboard`) — Dashboard stats, Student CRUD, Attendance marking & reports, Fee collection (cash + Razorpay), Faculty & Course management, Gallery uploads (Cloudinary), Enquiry tracking.
- **Auth.js** credentials-based admin login, protected by middleware.
- **Razorpay** integration with server-side HMAC signature verification before any fee is recorded as paid.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your own values:

```bash
cp .env.example .env.local
```

You'll need:
- A **MongoDB Atlas** cluster connection string
- A **Cloudinary** account (cloud name, API key, API secret)
- A **Razorpay** account (test mode keys are fine for development)
- An `AUTH_SECRET` — generate one with `npx auth secret` or `openssl rand -base64 32`

> **Auth.js v5 note:** This project uses `next-auth@5.x` which renamed the env variables.  
> Use `AUTH_SECRET` (not `NEXTAUTH_SECRET`) and `AUTH_URL` (not `NEXTAUTH_URL`).  
> Using the old names will cause sessions to silently fail — login appears to succeed but immediately redirects back to `/login`.

### 3. Seed the database

This creates a demo admin login plus sample students, faculty, courses, attendance, fees, and enquiries.

```bash
npm run seed
```

Or, once the dev server is running, visit `GET /api/seed` in your browser (useful in environments where running scripts directly is inconvenient).

**Demo admin login:**
```
Email:    admin@brightfuture.com
Password: Admin@123
```

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site, and `http://localhost:3000/login` for admin access.

## Project structure

```
app/
  (public)/        → public website pages (home, about, courses, faculty, gallery, contact)
  admin/           → protected admin panel pages
  api/             → all backend API routes
  login/           → admin login page
components/
  public/          → public website components
  admin/           → admin panel components, grouped by module
  ui/              → shadcn-style UI primitives
lib/               → db connection, cloudinary, razorpay, utils
models/            → Mongoose schemas (Admin, Student, Faculty, Course, Attendance, Fee, Gallery, Enquiry)
types/             → shared TypeScript DTOs
scripts/seed.ts    → standalone seed script
auth.ts            → Auth.js configuration
middleware.ts      → protects /admin/* routes
```

## Key implementation notes

- **Attendance** is stored one document per class per day (with a nested `records` array), not one document per student per day — keeps queries cheap and avoids duplicate marking.
- **Fee status** is tracked via `totalFee` / `feesPaid` fields directly on the Student document (with a `pendingFee` virtual), rather than always summing a separate ledger — fast to read on every student list view.
- **Razorpay payments are verified server-side** via HMAC-SHA256 signature check in `/api/razorpay/verify` before any Fee document is created. Never trust the client-side success callback alone.
- **Soft deletes** — removing a student or faculty member sets `isActive: false` rather than deleting the document, preserving historical attendance and fee records.
- **Roll numbers** auto-increment per class if not provided when adding a student.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel.
3. Add all variables from `.env.example` to the Vercel project's Environment Variables.
4. In MongoDB Atlas, add `0.0.0.0/0` to the IP access list (or Vercel's specific egress IPs) so the deployed app can connect.
5. Update `NEXTAUTH_URL` to your production domain.
6. Switch Razorpay keys to live mode when ready to accept real payments.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Shadcn-style UI · MongoDB Atlas + Mongoose · Auth.js v5 · Cloudinary · Razorpay
