# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkyUp is a Twitter/X-inspired full-stack social media app. Live at https://skyup-pi.vercel.app/

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, Zustand, Axios
- **Backend**: FastAPI, SQLModel, PostgreSQL, Alembic, JWT auth, Cloudinary (media), FastAPI-Mail
- **Package managers**: `pnpm` (frontend), `uv` (backend)

## Development Commands

### Backend (from `backend/`)

```bash
make dev              # Start FastAPI dev server
make migrate-auto -m "message"  # Generate migration from model changes
make migrate-up       # Apply pending migrations
make migrate-down     # Rollback last migration
make seed             # Seed database with fake data
```

Or directly:
```bash
uv run fastapi dev app/main.py
```

### Frontend (from `frontend/`)

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm add-shadcn       # Add shadcn/ui component (e.g. pnpm add-shadcn button)
```

### Docker (from root)

```bash
docker compose up     # Start full stack (PostgreSQL + backend + frontend)
```

## Architecture

### Authentication Flow

- Backend issues JWT **access token** (15 min) in response body + **refresh token** (30 days) as HttpOnly cookie
- Frontend stores access token in memory; `lib/auth/auth.ts` → `getSession()` calls `GET /api/users/me` server-side
- `proxy.ts` (Next.js middleware) reads an `auth-hint` cookie to redirect unauthenticated users to `/sign-in`
- Unauthenticated visitors bypass login via a special flow in `b8fd034`

### Backend Structure

Routes registered in `app/main.py` under `/api/*`:
- `authentication.py` — sign-up, login, token refresh, email verification
- `user.py` — `/users/me`, search, user lookup
- `post.py` — CRUD posts, likes, bookmarks, media upload
- `reply.py` — create & list replies
- `relation.py` — follow/unfollow
- `profile.py` — profile updates (avatar, banner, bio)

`deps.py` holds FastAPI dependency injection: `get_current_user`, `get_current_verified_user`, `validate_user_creation`.

`helpers/subqueries.py` contains SQL subqueries for computing counts (likes, replies, bookmarks) and relationship status in a single DB call.

### Frontend Structure

Protected routes live under `app/(protected-routes)/`. Auth pages are `sign-in/`, `sign-up/`, `account-verification/`.

State management split:
- **Zustand** (`lib/store/store.ts`) — UI state only (modal open/close, active tab)
- **TanStack Query** — all server state; query options centralized in `lib/query-options.ts`
- **Axios** (`lib/axios/`) — two clients: browser (with token interceptor) and server-side

Custom hooks in `hooks/` encapsulate mutations with React Query cache invalidation (e.g., `use-follow.ts`, `use-post-like.ts`).

### Database Models (`backend/app/models.py`)

`User` → `Profile` (1:1), `Post`, `Reply`, `Like`, `Bookmark`, `Relation` (follows), `EmailVerification`

UUID7 are used for database items IDs (generated in `helpers/db.py`).

## Environment Variables

**Backend** (`.env`): `DATABASE_URL`, `SECRET_KEY`, `CLOUDINARY_*`, `MAIL_*`, `ENVIRONMENT` (dev/test/prod)

**Frontend** (`.env.local`): `NEXT_PUBLIC_API_URL` (backend base URL)
