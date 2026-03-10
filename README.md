# SkyUp

SkyUp is a full-stack social app inspired by Twitter/X.  
It includes authentication, posts, replies, likes, bookmarks, profiles, and follow relationships.

🔗**Visite the app by clicking https://skyup-pi.vercel.app/** **→**

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
- `Docker` for containerization

## Project Structure

```text
skyup/
|-- README.md
|-- backend/
|   |-- pyproject.toml
|   |-- uv.lock
|   |-- Makefile
|   |-- alembic.ini
|   |-- Dockerfile
|   |-- app/
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
|   |-- Dockerfile
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
|-- compose.yml
|-- .gitignore
```

## Prerequisites
- Docker 
- Cloudinary account
- SMTP credentials (for email verification)
- Mailtrap account (for mail testing)

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
cd skyup
docker compose up --build
```

### 2. Run database migrations manually

```bash
cd backend
make migrate-up
```

### 3. (Optional) Seed sample data

```bash
cd backend
make seed
```

## API Overview
Just visit FastAPI docs to see all endpoints: `http://localhost:8000/docs

## Notes

- This repository currently contains generated folders (`backend/.venv`, `frontend/node_modules`, `frontend/.next`) in local workspace; they should generally stay out of Git history.
