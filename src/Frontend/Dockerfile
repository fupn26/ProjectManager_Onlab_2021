FROM nginx:1.21.4-alpine AS base
WORKDIR /app
EXPOSE 80
COPY ["nginx.conf", "/etc/nginx/nginx.conf"]

FROM node:14-alpine as build
ARG REACT_APP_BASE_URL
ENV REACT_APP_BASE_URL $REACT_APP_BASE_URL
WORKDIR /src
COPY ["./", "Client/"]
WORKDIR /src/Client
RUN yarn
RUN yarn build

FROM base AS final
WORKDIR /app
COPY --from=build /src/Client/build /app/wwwroot