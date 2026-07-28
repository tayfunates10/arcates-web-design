# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json ./
RUN npm install --no-audit --no-fund

FROM deps AS builder
COPY . .
RUN npm run build

FROM base AS migrate
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
CMD ["npm", "run", "db:deploy"]

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN groupadd --system --gid 1001 arcates \
  && useradd --system --uid 1001 --gid arcates --home-dir /app arcates
COPY --from=builder /app/public ./public
COPY --from=builder --chown=arcates:arcates /app/.next/standalone ./
COPY --from=builder --chown=arcates:arcates /app/.next/static ./.next/static
USER arcates
EXPOSE 3000
CMD ["node", "server.js"]
