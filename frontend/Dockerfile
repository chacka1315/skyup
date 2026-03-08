# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG PNPM_VERSION=10.30.3

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

FROM base AS deps
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS dev
ENV NODE_ENV=development
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

FROM deps AS prod-build
ENV NODE_ENV=production
COPY --chown=node:node . .
RUN pnpm run build

FROM node:${NODE_VERSION}-alpine AS prod
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=prod-build --chown=nextjs:nodejs /app/public ./public
COPY --from=prod-build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=prod-build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
