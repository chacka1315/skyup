ARG PYTHON_VERSION=3.12

# BASE STAGE
FROM python:${PYTHON_VERSION}-slim AS base
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_COMPILE_BYTE=1
ENV UV_LINK_MODE=copy
ENV UV_CACHE_DIR=/tmp/.cache/uv
WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH"
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
RUN apt-get update && apt-get install -y --no-install-recommends \
    make \
    && rm -rf /var/lib/apt/lists/*

# DEPS STAGE
FROM base AS deps
COPY ./pyproject.toml ./uv.lock ./.python-version /app/
# Installe les deps sans le projet pour profiter du cache
RUN --mount=type=cache,target=/tmp/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# DEV STAGE
FROM deps AS dev
COPY . .
# Installe le projet maintenant que le code est copié
RUN --mount=type=cache,target=/tmp/.cache/uv \
    uv sync --frozen --no-dev
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["uv","run","fastapi","dev","app/main.py","--host","0.0.0.0","--port","8000"]

# PROD STAGE
FROM deps AS prod
COPY . .
RUN --mount=type=cache,target=/tmp/.cache/uv \
    uv sync --frozen --no-dev

RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "make migrate-up && uv run fastapi run app/main.py --host 0.0.0.0 --port 8000"]