# Tuitora — Dibrugarh Tuition Finder (Next.js + Clerk + MongoDB)

Tuitora is a full-stack hyper-local platform designed to connect students and parents with qualified home tutors across Dibrugarh, Assam.

---

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Authentication:** Clerk Authentication (`@clerk/nextjs` with instant Webhook & auto-sync)
- **Database:** MongoDB (`mongodb` official driver with connection pooling)
- **Styling:** Tailwind CSS, Radix UI primitives, Lucide Icons, Sonner Toasts
- **Language:** TypeScript & JavaScript

---

## 📁 Project Structure

```
tution-app/
├── .env                       # Root environment variables (Clerk keys, MongoDB URI)
├── middleware.ts              # Clerk authentication route protection
├── lib/
│   ├── mongodb.ts            # MongoDB connection singleton
│   ├── auth.ts               # User session & Clerk-to-MongoDB sync helper
│   ├── constants.ts          # Dibrugarh areas, classes, subjects, modes
│   └── utils.ts              # Styling helpers
├── components/
│   ├── Navbar.tsx             # Role-aware navigation with Clerk user button
│   ├── TutorCard.tsx          # Tutor profile card
│   └── ui/                   # Reusable UI components (Button, Card, Dialog, etc.)
├── app/
│   ├── layout.tsx             # Root layout with ClerkProvider & Sonner Toaster
│   ├── globals.css            # Earthy brand palette styling
│   ├── page.tsx               # Home landing page with live stats
│   ├── teachers/
│   │   ├── page.tsx           # Hyper-local tutor search & filtering
│   │   └── [id]/page.tsx      # Tutor profile with inquiry & report modals
│   ├── sign-in/[[...sign-in]] # Clerk Sign-In
│   ├── sign-up/[[...sign-up]] # Clerk Sign-Up
│   ├── dashboard/
│   │   ├── page.tsx           # Role redirector (student / teacher / admin)
│   │   ├── student/page.tsx   # Student inquiries, learning profile, saved tutors
│   │   ├── teacher/page.tsx   # Teacher inbox, availability toggle, profile editor
│   │   ├── admin/page.tsx     # Admin statistics, verification, moderation
│   │   └── onboarding/page.tsx# New user account type selection
│   └── api/                   # Next.js Route Handlers (REST API)
│       ├── webhooks/clerk/    # Instant Clerk Webhook synchronization
│       ├── teachers/          # Teacher search, details, availability
│       ├── students/          # Student learning profile & requirements
│       ├── requests/          # Tuition inquiries & status updates
│       ├── saved/             # Saved/bookmarked tutors
│       ├── reports/           # Profile issue reports
│       └── admin/             # Verification, statistics, user blocking
├── scripts/
│   └── seed.mjs               # Database seeder for sample Dibrugarh tutors
└── legacy/                    # Archived previous FastAPI & React SPA codebase
```

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Open `.env` in the root folder and configure:
```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=tuitora_database

# Clerk Authentication Keys (From https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### 2. Seed Database with Dibrugarh Tutors
Populate local MongoDB with initial verified tutors across Dibrugarh localities (Chowkidingee, Naliapool, Amolapatty, etc.):
```bash
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ Production Build
To test or create a production build:
```bash
npm run build
npm start
```
