FROM node:20-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile --network-concurrency 5

COPY . .
COPY .env.prod ./.env.prod

RUN set -a && . ./.env.prod && set +a && yarn build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["yarn", "start"]
