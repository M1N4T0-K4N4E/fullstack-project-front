FROM node:20-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV YARN_NPM_REGISTRY_SERVER=https://registry.npmjs.org

COPY package.json yarn.lock ./
RUN corepack enable && yarn config set registry https://registry.npmjs.org || yarn config set npmRegistryServer https://registry.npmjs.org
RUN corepack enable && yarn install --frozen-lockfile --network-concurrency 5

COPY . .
RUN yarn build

COPY .env.prod ./.env.prod

ENV NODE_ENV=production

EXPOSE 3000
CMD ["yarn", "start"]
