FROM node:current-alpine

COPY ./angular-fe /app/angular-fe
WORKDIR /app/angular-fe
RUN npm ci
RUN npm run build
RUN npm run build-storybook

RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python2 && \
    npm install --quiet node-gyp -g
COPY ./node /app/node
WORKDIR /app/node
RUN npm ci
RUN apk del native-deps

ENTRYPOINT node --max-http-header-size 30000 index.js



