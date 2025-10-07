FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./

RUN yarn install --frozen-lockfile || yarn install

COPY . .

RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json  ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]