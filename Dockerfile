FROM node:22-alpine AS builder

WORKDIR /builder

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM httpd:alpine AS runner

COPY --from=builder /builder/dist/ /usr/local/apache2/htdocs/
