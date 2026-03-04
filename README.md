# SkyUp

SkyUp is a full-stack social app inspired by Twitter/X.  
It includes authentication, posts, replies, likes, bookmarks, profiles, and follow relationships.

## Features

- Email/password authentication with email verification
- JWT access token + refresh token flow
- Create, edit, and delete posts (text + optional media upload)
- Replies on posts
- Like and bookmark system
- Follow / unfollow users
- Personalized feed + weekly trending posts
- Editable user profile (avatar, banner, bio, country, birthday)

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- TanStack Query, Zustand, Axios

### Backend

- FastAPI + SQLModel
- Alembic migrations
- PostgreSQL
- JWT auth
- Cloudinary (media storage)
- FastAPI-Mail (email verification/welcome)
- `uv` for dependency/runtime management

## Architecture

- `frontend` is a Next.js client app
- `backend` exposes REST endpoints under `/api/*`
- Frontend calls backend using `NEXT_PUBLIC_API_URL`
- Refresh token is stored in an HttpOnly cookie
- Media files are uploaded to Cloudinary

## Project Structure

```text
skyup/
|-- README.md
|-- backend/
|   |-- pyproject.toml
|   |-- uv.lock
|   |-- Makefile
|   |-- alembic.ini
|   `-- app/
|       |-- main.py
|       |-- models.py
|       |-- deps.py
|       |-- core/
|       |   |-- config.py
|       |   |-- cors.py
|       |   |-- db.py
|       |   `-- email.py
|       |-- routes/
|       |   |-- authentication.py
|       |   |-- user.py
|       |   |-- relation.py
|       |   |-- post.py
|       |   |-- reply.py
|       |   `-- profile.py
|       |-- helpers/
|       |-- schemas/
|       |-- migrations/
|       |   `-- versions/
|       |-- scripts/
|       |   `-- seed.py
|       `-- templates/
|           `-- emails/
|-- frontend/
|   |-- package.json
|   |-- pnpm-lock.yaml
|   |-- next.config.ts
|   |-- proxy.ts
|   |-- app/
|   |   |-- layout.tsx
|   |   |-- globals.css
|   |   |-- sign-in/
|   |   |-- sign-up/
|   |   |-- account-verification/
|   |   `-- (protected-routes)/
|   |-- components/
|   |   |-- posts/
|   |   |-- replies/
|   |   |-- profile/
|   |   |-- single-post/
|   |   |-- users/
|   |   |-- skeletons/
|   |   `-- ui/
|   |-- hooks/
|   |-- lib/
|   |   |-- auth/
|   |   |-- axios/
|   |   |-- store/
|   |   `-- zod/
|   |-- types/
|   `-- public/
`-- .gitignore
```

## Prerequisites

- Node.js 20+
- `pnpm`
- Python 3.12+
- `uv`
- PostgreSQL
- Cloudinary account
- SMTP credentials (for email verification)

## Environment Variables

### Backend (`backend/.env`)

```bash
PY_ENV=dev
DATABASE_URL=postgresql+psycopg://<user>:<password>@<host>:<port>/<db>
TEST_DATABASE_URL=postgresql+psycopg://<user>:<password>@<host>:<port>/<test_db>

CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

MAIL_USERNAME=<smtp_user>
MAIL_FROM=<sender_email>
MAIL_FROM_NAME=<sender_name>
MAIL_PASSWORD=<smtp_password>
MAIL_PORT=<smtp_port>
MAIL_SERVER=<smtp_host>
EMAIL_VERIFICATION_MINUTES=10

TEST_MAIL_USERNAME=<optional_dev_mail_user>
TEST_MAIL_PASSWORD=<optional_dev_mail_password>
TEST_MAIL_SERVER=<optional_dev_mail_server>

ACCESS_TOKEN_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
TOKEN_ALGORITHM=HS256
```

### Frontend (`frontend/.env`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Local Development

### 1. Install dependencies

```bash
# backend
cd backend
uv sync

# frontend
cd ../frontend
pnpm install
```

### 2. Run database migrations

```bash
cd backend
make migrate-up
```

### 3. (Optional) Seed sample data

```bash
cd backend
make seed
```

### 4. Start backend

```bash
cd backend
make dev
```

FastAPI docs: `http://localhost:8000/docs`

### 5. Start frontend

```bash
cd frontend
pnpm dev
```

Open `http://localhost:3000`.

## API Overview

- `POST /api/auth/sign-up/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/auth/logout/`
- `GET /api/users/me/`
- `GET /api/users/`
- `POST /api/relations/` and `DELETE /api/relations/`
- `GET /api/posts/` (feed)
- `GET /api/posts/trends/`
- `POST /api/posts/`, `PUT /api/posts/{post_id}/`, `DELETE /api/posts/{post_id}/`
- `POST|DELETE /api/posts/{post_id}/like/`
- `POST|DELETE /api/posts/{post_id}/bookmark/`
- `GET /api/posts/{post_id}/replies/` and related reply CRUD
- `PUT /api/profiles/`

## Notes

- This repository currently contains generated folders (`backend/.venv`, `frontend/node_modules`, `frontend/.next`) in local workspace; they should generally stay out of Git history.
