FROM nginx:1.21.4-alpine AS base
WORKDIR /app
EXPOSE 80
COPY ["nginx.conf", "/etc/nginx/nginx.conf"]

FROM node:14-alpine as build
WORKDIR /src
COPY ["./", "Client/"]
WORKDIR /src/Client
RUN npm install
RUN npm run build

FROM base AS final
WORKDIR /app
COPY --from=build /src/Client/build /app/wwwroot