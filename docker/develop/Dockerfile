FROM node:current-alpine AS build

COPY ./angular-fe /app/angular-fe
WORKDIR /app/angular-fe

RUN npm ci
COPY . .
RUN npm run build

FROM node:current-alpine

# Node server dependencies
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python2 && \
    npm install --quiet node-gyp -g

COPY ./node /app/node
WORKDIR /app/node
RUN npm ci

COPY --from=build /app/angular-fe /app/angular-fe

# Remove dependencies after install
RUN apk del native-deps

EXPOSE 80
ENTRYPOINT node --max-http-header-size 30000 index.js



