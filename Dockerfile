FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN corepack enable && pnpm install --prod=false
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json ./
COPY src ./src
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json server.mjs ./
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "server.mjs"]
