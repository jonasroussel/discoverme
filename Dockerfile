FROM node:20-alpine AS build

WORKDIR /build

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS app

WORKDIR /app

COPY --from=build /build/package.json /build/package-lock.json ./

RUN npm install --omit=dev

COPY --from=build /build/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

CMD ["npm", "run", "start"]
