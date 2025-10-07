FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN yarn install --production

COPY --from=development /app/dist ./dist

EXPOSE 3002

CMD ["node", "dist/main.js"]