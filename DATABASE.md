# SecondSpark — Database & Authentication Architecture

This document details the database schema, security practices, migration protocols, and production PostgreSQL configuration for **SecondSpark — The Project Graveyard**.

---

## 1. Architecture Overview

SecondSpark utilizes **Prisma ORM** paired with **Auth.js (NextAuth v5)** for authentic server-side session management and user-isolated project persistence.

```
┌────────────────────────────────────────────────────────┐
│                   SecondSpark Clients                  │
│   Landing Page (/) | Login (/login) | Dashboard (/dashboard)
└──────────────────────────┬─────────────────────────────┘
                           │ Authenticated HTTP / Cookies
┌──────────────────────────▼─────────────────────────────┐
│                 Next.js App Router (Server)            │
│  - /api/auth/[...nextauth]  (Auth.js JWT Sessions)    │
│  - /api/auth/register       (Bcrypt Password Hashing)  │
│  - /api/projects            (User-Scoped CRUD)         │
│  - /api/projects/migrate    (Browser Data Migration)   │
└──────────────────────────┬─────────────────────────────┘
                           │ Prisma Client v6 (PrismaAdapter)
┌──────────────────────────▼─────────────────────────────┐
│                   Relational Database                  │
│  - Development: SQLite (prisma/dev.db)                 │
│  - Production:  PostgreSQL (Supabase / Neon / RDS)     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Security & Credential Storage Policies

1. **Password Hashing**:
   - Algorithms: **Bcrypt** with salt cost factor 12.
   - Plaintext passwords are never stored, logged, or returned in any API response.
2. **Session Cookies**:
   - Handled exclusively via Auth.js cryptographic JWT session tokens.
   - Cookies are marked `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).
3. **Zero Insecure Browser Storage**:
   - Neither passwords, OAuth access tokens, nor session secrets are ever stored in `localStorage` or `sessionStorage`.
4. **Data Isolation**:
   - Every project query and mutation on `/api/projects` filters strictly by the authenticated `userId: session.user.id`.
   - Direct access to another user's project ID returns HTTP `403 Forbidden`.

---

## 3. Database Schema (`prisma/schema.prisma`)

### Models
- **`User`**: Account owner (`id`, `name`, `email`, `passwordHash`, `image`, timestamps).
- **`Account`**: OAuth provider links (GitHub OAuth tokens, provider account IDs).
- **`Session`**: Active database sessions (used when session strategy is database or adapter).
- **`Project`**: Entombed software repositories associated with `userId`.
- **`ProjectTimelineEvent`**: Chronological event logs (status changes, updates, tombstones).

---

## 4. Local Development (SQLite)

SecondSpark defaults to a zero-configuration, persistent SQLite database located at `prisma/dev.db`.

### Setup Commands:
```bash
# Push schema changes to local database
npx prisma db push

# Generate updated Prisma client
npx prisma generate

# Inspect database visually with Prisma Studio
npx prisma studio
```

---

## 5. Production Migration to PostgreSQL

When deploying SecondSpark to production (Vercel, Railway, Fly.io, Cloud Run) with a PostgreSQL provider (Supabase, Neon, AWS RDS):

### Step 1: Update Prisma Datasource Provider
In `prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Set PostgreSQL Connection Strings
In `.env.local` or your production environment variables:
```bash
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/secondspark?schema=public&sslmode=require"
```

### Step 3: Run Database Migrations
Create and apply migrations:
```bash
# Create and apply initial migration
npx prisma migrate dev --name init_postgres

# In production CI/CD pipelines
npx prisma migrate deploy
```

---

## 6. Browser Data Migration Protocol (`/api/projects/migrate`)

To ensure existing users who created projects in browser `localStorage` do not lose their work:

1. When a user registers or logs in, `projectRepository.syncWithServer()` executes in the browser.
2. It detects any locally entombed projects in `localStorage` under `secondspark_graveyard_projects_v1`.
3. If unmigrated projects are present, it issues an authenticated `POST /api/projects/migrate`.
4. The server performs duplicate detection by project name and repository URL, then writes the projects to PostgreSQL/SQLite under the user's `userId`.
5. A client flag `secondspark_migrated_to_db_v1` is set to prevent duplicate migrations, while keeping browser state synchronized with cloud records.
