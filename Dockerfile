FROM node:20-bullseye-slim AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY jest.config.ts ./

RUN npm run build

FROM node:20-bullseye-slim AS runtime
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN apt-get update \
  && apt-get install -y postgresql-client \
  && rm -rf /var/lib/apt/lists/* \
  && npm install --production

COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
