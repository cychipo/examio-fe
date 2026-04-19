FROM node:20-alpine AS base
RUN corepack enable && corepack prepare yarn@4.9.2 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

FROM deps AS builder
COPY . .
RUN yarn build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 4173
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "4173"]
