FROM node:26 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:26-alpine

WORKDIR /app

COPY --from=builder /app .

ENTRYPOINT ["node", "index.js"]