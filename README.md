# Tuitora — Dibrugarh Tuition Finder

**A full-stack hyper-local platform designed to connect students and parents with qualified home tutors across Dibrugarh, Assam.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Live Demo](https://tuitora.vercel.app/) · [Repository](https://github.com/PratyayPB/tuitora) · [Report an Issue](https://github.com/PratyayPB/tuitora/issues)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Screenshots / Demo](#screenshots--demo)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Authentication & Authorization](#authentication--authorization)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

### What is the project?

Tuitora is a localized web application that bridges the gap between students seeking educational assistance and qualified tutors in Dibrugarh, Assam. Built with modern web technologies, it offers a seamless experience for both parties to connect, manage inquiries, and facilitate learning.

### Problem Statement

Finding reliable, local home tutors is often a disjointed process relying on word-of-mouth or unverified local advertisements. Parents and students struggle to find tutors that match their specific subject needs, preferred locations, and schedules within Dibrugarh.

### Solution

Tuitora centralizes the tutor discovery process for Dibrugarh. It provides a secure, role-based platform where verified tutors can showcase their profiles, and students/parents can easily search, filter, and send tuition inquiries.

### Project Goals

- Provide a dedicated, easy-to-use search platform tailored specifically for the Dibrugarh locality.
- Ensure secure and verified connections between tutors and students.
- Streamline the inquiry and status-tracking process for tuitions.

---

## Key Features

- **Hyper-Local Search** — Filter tutors by specific Dibrugarh localities (e.g., Chowkidingee, Naliapool, Amolapatty), subjects, and classes.
- **Role-Based Dashboards** — Distinct interfaces and workflows for Students, Teachers, and Administrators.
- **Tuition Inquiries** — Students can send direct requests to tutors and track their status (pending, accepted, rejected).
- **Tutor Profiles** — Teachers can manage their availability, subjects taught, and professional details.
- **Admin Moderation** — Dedicated admin tools for user verification, statistics monitoring, and issue resolution (reports/blocking).
- **Instant Data Sync** — Real-time synchronization of user authentication data to the database using Clerk Webhooks.

---

## Screenshots / Demo

### Application Preview

![Screenshot 1](https://ik.imagekit.io/ulycoljug/Portfolio-resources/tuitora/Screenshot%202026-09-30%20124617.png)
![Screenshot 2](https://ik.imagekit.io/ulycoljug/Portfolio-resources/tuitora/Screenshot%202026-09-30%20124650.png)
![Screenshot 3](https://ik.imagekit.io/ulycoljug/Portfolio-resources/tuitora/Screenshot%202026-09-30%20124701.png)
![Screenshot 4](https://ik.imagekit.io/ulycoljug/Portfolio-resources/tuitora/Screenshot%202026-09-30%20124706.png)
![Screenshot 5](https://ik.imagekit.io/ulycoljug/Portfolio-resources/tuitora/Screenshot%202026-09-30%20124720.png)
![Screenshot 6](https://ik.imagekit.io/ulycoljug/Portfolio-resources/tuitora/Screenshot%202026-09-30%20124751.png)

### Demo

**Live Application:** [https://tuitora.vercel.app/](https://tuitora.vercel.app/)

---

## Tech Stack

### Frontend

- **Technology:** React
- **Framework:** Next.js 14 (App Router)
- **UI Library:** Radix UI primitives, Lucide Icons, Sonner Toasts
- **Styling Solution:** Tailwind CSS

### Backend

- **Runtime:** Node.js
- **Framework:** Next.js API Routes (REST)
- **Language:** TypeScript

### Database

- **Database:** MongoDB
- **Driver:** Official `mongodb` driver with connection pooling

### Authentication & Authorization

- **Authentication Provider:** Clerk (`@clerk/nextjs`)

---

## Architecture

Tuitora utilizes a modern serverless architecture powered by Next.js and Vercel. 

- **Client Layer:** Renders responsive UI components using React and Tailwind CSS.
- **API/Backend Layer:** Next.js Route Handlers act as the REST API, processing requests, applying business logic, and communicating with the database.
- **Authentication Flow:** Clerk handles all identity management. When a user signs up or updates their profile, Clerk sends a webhook (secured by Svix) to the backend, which syncs the user data into MongoDB.
- **Database Layer:** MongoDB stores application-specific data such as tutor profiles, tuition inquiries, saved items, and moderation reports.

---

## Project Structure

```text
tution-app/
├── app/
│   ├── api/                   # Next.js Route Handlers (REST API)
│   ├── dashboard/             # Role-specific dashboards (Admin, Student, Teacher)
│   ├── teachers/              # Public tutor search and profile pages
│   ├── sign-in/               # Clerk Sign-In flow
│   ├── sign-up/               # Clerk Sign-Up flow
│   ├── layout.tsx             # Root layout with ClerkProvider
│   └── globals.css            # Global styles and Tailwind directives
├── components/
│   ├── ui/                    # Reusable Radix/Tailwind UI components
│   └── ...                    # Feature-specific components (Cards, Navbars)
├── lib/
│   ├── mongodb.ts             # MongoDB connection singleton
│   ├── auth.ts                # Session & Sync helpers
│   └── constants.ts           # Shared app constants (Locations, Subjects)
├── scripts/
│   └── seed.mjs               # Database seeder for sample data
├── .env.example               # Example environment variables
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js (v18+)
- npm
- Git
- MongoDB (Local instance or Atlas URI)

### Clone the Repository

```bash
git clone https://github.com/PratyayPB/tuitora.git
cd tuitora
```

### Install Dependencies

```bash
npm install
```

### Database Setup

Populate your local MongoDB with initial verified tutors and areas across Dibrugarh:

```bash
npm run seed
```

### Run the Development Server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file in the root directory based on the variables below. 

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=tuitora_database

# Clerk Authentication Keys (From https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Variable Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | Target database name |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key for the frontend |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key for the backend |
| `CLERK_WEBHOOK_SECRET` | Yes | Secret to verify Clerk webhooks |

**Never commit real secrets, API keys, credentials, or private tokens to the repository.**

---

## Usage

### Student Workflow

1. Sign up for an account and select the **Student** role during onboarding.
2. Browse or search the `/teachers` directory by subject or Dibrugarh locality.
3. View a tutor's detailed profile.
4. Save tutors for later or send a direct tuition inquiry.
5. Track inquiry statuses from the Student Dashboard.

### Teacher Workflow

1. Sign up for an account and select the **Teacher** role.
2. Complete the profile setup (qualifications, subjects taught, areas covered).
3. Toggle profile visibility/availability from the Teacher Dashboard.
4. Receive, review, and accept/reject student tuition requests.

---

## API Documentation

The application exposes internal REST APIs for client-side interactions. 

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/teachers` | Fetch and filter available tutors |
| `GET` | `/api/teachers/:id` | Fetch specific tutor details |
| `POST` | `/api/requests` | Submit a new tuition inquiry |
| `GET` | `/api/requests/received` | Fetch requests sent to a teacher |
| `POST` | `/api/webhooks/clerk` | Endpoint for Clerk to sync user data |

---

## Database

### Database Technology

The project uses **MongoDB**, providing a flexible schema structure ideal for evolving user profiles, dynamic subject lists, and localized search queries.

### Core Entities

| Entity | Purpose |
|---|---|
| Users | Core identity, synced from Clerk, including role (Student/Teacher/Admin) |
| Profiles | Extended information for Teachers (qualifications, availability) |
| Requests | Tuition inquiries between Students and Teachers |
| Saved | Tutors bookmarked by Students |
| Reports | Moderation flags submitted against users or profiles |

---

## Authentication & Authorization

### Authentication

- Handled entirely by **Clerk**.
- Supports standard Email/Password and social logins.
- Webhooks ensure the local MongoDB stays in sync with Clerk's user registry.

### Authorization

- **Roles:** `student`, `teacher`, `admin`.
- **Route Protection:** Next.js Middleware (`middleware.ts`) protects dashboard routes and API endpoints, redirecting unauthorized users or un-onboarded users appropriately.
- **Server Checks:** API routes explicitly verify the requesting user's session and role before performing database mutations.

---

## Security

- **Authentication & Authorization:** Secure session management via Clerk.
- **Route Protection:** Middleware enforces role-based access control.
- **Webhook Verification:** Clerk webhooks are verified using the `svix` library to prevent spoofed data syncs.
- **Secure Database Access:** Environment variables protect connection strings, and the official MongoDB driver secures connections.

---

## Deployment

The application is optimized for deployment on Vercel.

### Deployment Steps

1. Push changes to the `main` branch.
2. Vercel automatically detects the Next.js project and runs the build step.
3. Ensure all Environment Variables (including Clerk and MongoDB Atlas URIs) are configured in the Vercel Dashboard.
4. Deployment completes successfully.

### Production Build (Local Testing)

```bash
npm run build
npm start
```

---

## Contributing

Contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Commit your changes: `git commit -m "feat: add my feature"`
5. Push the branch: `git push origin feature/my-feature`
6. Open a Pull Request

---

## License

This project is licensed under the **MIT License**.

See the LICENSE file for details.

---

## Author

**Pratyay Pratim Borah**

- GitHub: [@PratyayPB](https://github.com/PratyayPB)
- LinkedIn: [Pratyay Pratim Borah](https://www.linkedin.com/in/pratyaypratimborah/)
- Portfolio: [https://portfolio-pratyay.vercel.app/](https://portfolio-pratyay.vercel.app/)
